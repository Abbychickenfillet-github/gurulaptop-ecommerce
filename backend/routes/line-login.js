import express from 'express'
import jsonwebtoken from 'jsonwebtoken'
import 'dotenv/config.js'
const router = express.Router()

// ✅ 更改為使用 pgClient.js
import db from '##/configs/pgClient.js'

// line-login模組
import line_login from '#services/line-login.js'

// 定義安全的私鑰字串
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

// line 登入使用
const channel_id = process.env.LINE_CHANNEL_ID
const channel_secret = process.env.LINE_CHANNEL_SECRET
const callback_url = process.env.LINE_LOGIN_CALLBACK_URL

const LineLogin = new line_login({
  channel_id,
  channel_secret,
  // react line page callback url
  // 注意: LINE_LOGIN_CALLBACK_URL 是前端(react/next)路由
  // 必需要與 LINE Developer 的 "Callback URL" 設定一致
  // 目前與LINE登入頁設定為一致(登入頁路由=回調頁路由)
  callback_url,
  scope: 'openid profile',
  prompt: 'consent',
  bot_prompt: 'normal',
})

// ------------ 以下為路由 ------------
// 此api路由為產生登入網址，傳回前端後，要自己導向line網站進行登入
router.get('/login', LineLogin.authJson())

// 登出機制
router.get('/logout', async function (req, res, next) {
  // 檢查是否有傳入 line_uid
  if (!req.query.line_uid) {
    return res.json({ status: 'error', message: '缺少必要資料' })
  }

  try {
    // 找到是否有該line_uid會員
    const { rows: dbUsers } = await db.query(
      'SELECT * FROM users WHERE line_uid = $1',
      [req.query.line_uid]
    )
    const dbUser = dbUsers[0] // 取得第一筆資料

    // 檢查是否找到使用者
    if (!dbUser) {
      return res.json({ status: 'error', message: '使用者不存在' })
    }
    
    // 從資料庫結果中取得 line_access_token
    const line_access_token = dbUser.line_access_token

    // https://developers.line.biz/en/docs/line-login/managing-users/#logout
    // 登出時進行撤銷(revoke) access token
    await LineLogin.revoke_access_token(line_access_token)

    // 清除cookie
    res.clearCookie('accessToken', { httpOnly: true })
    // 因登入過程中也用到session，也會產生 SESSION_ID，所以也要清除
    res.clearCookie('SESSION_ID', { httpOnly: true })

    return res.json({ status: 'success', data: null })
  } catch (error) {
    console.error('登出失敗:', error)
    return res.status(500).json({ status: 'error', message: '登出失敗' })
  }
})

router.get(
  '/callback',
  LineLogin.callback(
    // 登入成功的回調函式 Success callback
    async (req, res, next, token_response) => {
      console.log(token_response)

      // 以下流程:
      // 1. 先查詢資料庫是否有同line_uid的資料
      // 2-1. 有存在 -> 執行登入工作
      // 2-2. 不存在 -> 建立一個新會員資料(無帳號與密碼)，只有line來的資料 -> 執行登入工作

      const line_uid = token_response.id_token.sub

      // 1. 先查詢資料庫是否有同line_uid的資料
      // ✅ 轉換為 pg 的 COUNT 語法
      const { rows: countRows } = await db.query(
        'SELECT COUNT(*) FROM users WHERE line_uid = $1',
        [line_uid]
      )
      const total = parseInt(countRows[0].count, 10)

      // 要加到access token中回傳給前端的資料
      // 存取令牌(access token)只需要id和username就足夠，其它資料可以再向資料庫查詢
      let returnUser = {
        id: 0,
        username: '',
        google_uid: '',
        line_uid: '',
      }

      if (total > 0) {
        // 2-1. 有存在 -> 從資料庫查詢會員資料
        // ✅ 轉換為 pg 的 SELECT 語法
        const { rows: userRows } = await db.query(
          'SELECT * FROM users WHERE line_uid = $1',
          [line_uid]
        )
        const dbUser = userRows[0]

        // 回傳給前端的資料
        returnUser = {
          id: dbUser.user_id, // ✅ 使用 user_id，與你的資料表對應
          username: dbUser.username || dbUser.name || '', // 使用 username 或 name
          google_uid: dbUser.google_uid || '',
          line_uid: dbUser.line_uid,
        }
      } else {
        // 2-2. 不存在 -> 建立一個新會員資料(無帳號與密碼)，只有line來的資料 -> 執行登入工作
        const user = {
          name: token_response.id_token.name,
          email: '',
          line_uid: token_response.id_token.sub,
          line_access_token: token_response.access_token,
          photo_url: token_response.id_token.picture,
        }

        // 新增會員資料
        // ✅ 轉換為 pg 的 INSERT 語法並使用 RETURNING 回傳新資料
        const { rows: newRows } = await db.query(
          `INSERT INTO users (
            name, email, line_uid, line_access_token, photo_url,
            created_at, valid, level
          ) VALUES (
            $1, $2, $3, $4, $5,
            CURRENT_TIMESTAMP, TRUE, 0
          ) RETURNING *`,
          [
            user.name,
            user.email,
            user.line_uid,
            user.line_access_token,
            user.photo_url,
          ]
        )
        const newUser = newRows[0]

        // 回傳給前端的資料
        returnUser = {
          id: newUser.user_id, // ✅ 使用 user_id，與你的資料表對應
          username: newUser.name,
          google_uid: newUser.google_uid || '',
          line_uid,
        }
      }

      // 產生存取令牌(access token)，其中包含會員資料
      const accessToken = jsonwebtoken.sign(returnUser, accessTokenSecret, {
        expiresIn: '3d',
      })

      // 使用httpOnly cookie來讓瀏覽器端儲存access token
      res.cookie('accessToken', accessToken, { httpOnly: true })

      // 傳送access token回應(react可以儲存在state中使用)
      return res.json({
        status: 'success',
        data: {
          accessToken,
        },
      })
    },
    // 登入失敗的回調函式 Failure callback
    (req, res, next, error) => {
      console.log('line login fail')

      return res.json({ status: 'error', message: { error } })
    }
  )
)

export default router
