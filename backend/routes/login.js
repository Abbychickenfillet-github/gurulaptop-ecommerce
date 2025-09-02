import express from 'express'
import authenticate from '#middlewares/authenticate.js'
import pool from '##/configs/pgClient.js'
import multer from 'multer'
import jsonwebtoken from 'jsonwebtoken'
import { compareHash } from '#db-helpers/password-hash.js'
import {passwordMatch} from './auth.js'
// ========================================
// 🔐 統一的認證邏輯 - login.js
// ========================================
// 這個文件負責所有的認證相關邏輯：
// - 登入 (POST /)
// - 登出 (POST /logout)
// - JWT token 生成和驗證
// 
// 其他文件中的重複邏輯已被註解掉：
// - auth.js 中的登入/登出邏輯
// - authenticate.js 中的重複驗證邏輯
// ========================================

const upload = multer()
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
const router = express.Router()
console.log(`process.env.NEXT_PUBLIC_API_BASE_URL`, process.env.NEXT_PUBLIC_API_BASE_URL)


/* GET home page. */
router.post('/', upload.none(), async (req, res, next) => {
  const { email, password } = req.body

  try {
    const { email, password } = req.body
    console.log('🔐 登入請求開始')
    console.log('📧 接收到的 email:', email)
    console.log('🔑 接收到的 password:', password ? '[已隱藏]' : '未提供')
    
    // 從資料庫查詢使用者，並確保帳號是有效的
    console.log('🔍 查詢資料庫中的使用者...')
    const { rows: users } = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND valid = TRUE',
      [email]
    )
    const user = users[0]
    console.log('👤 資料庫查詢結果:', user ? `找到使用者 ID: ${user.user_id}` : '未找到使用者')

    // 檢查是否有找到使用者。如果找不到，表示帳號不存在或已被停用。
    if (!user) {
      return res.json({
        status: 'error',
        message: '帳號或密碼錯誤。或已停用本帳號，請聯繫客服',
      })
    }
    
    // 如果密碼不匹配，返回錯誤訊息
    console.log('🔐 驗證密碼...')
    const isPasswordValid = passwordMatch(password, user.password)
    console.log('🔐 密碼驗證結果:', isPasswordValid ? '正確' : '錯誤')
    
    if (!isPasswordValid) {
      console.log('❌ 密碼驗證失敗')
      return res.json({
        status: 'error',
        message: '帳號或密碼錯誤',
      })
    }

    // 如果帳號密碼都正確，生成 JWT Token
    console.log('🎫 生成 JWT Token...')
    const token = jsonwebtoken.sign(
      {
        user_id: user.user_id,
        email: user.email,
        country: user.country,
        city: user.city,
        road_name: user.road_name,
        detailed_address: user.detailed_address,
        level: user.level,
        phone: user.phone,
      },
      accessTokenSecret,
      { expiresIn: '2d' }
    )
    console.log('🎫 JWT Token 生成成功，使用者 ID:', user.user_id)

    // 设置 JWT token 到 cookie
    console.log('🍪 設置 JWT Token 到 Cookie...')
    res.cookie('accessToken', token, {
      httpOnly: true, // 改為 true，與 auth.js 保持一致
      secure: process.env.NODE_ENV === 'production', // 動態判斷環境
      sameSite: 'lax', // 改为 lax，避免跨域问题
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2天
      path: '/',
      domain: 'localhost' // 添加 domain 參數，與清除時保持一致
    })
    console.log('🍪 Cookie 設置完成')

    // 登入成功，這裡是負責看JWT有沒有問題。如果有問題可能是這裡。返回 JWT Token 和用户数据
    console.log('✅ 登入成功，準備返回用戶資料')
    return res.json({
      status: 'success',
      token,
      message: '登入成功',
      data: {
        user_id: user.user_id,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        gender: user.gender || '',
        birthdate: user.birthdate || '',
        country: user.country || '',
        city: user.city || '',
        district: user.district || '',
        road_name: user.road_name || '',
        detailed_address: user.detailed_address || '',
        remarks: user.remarks || '',
        level: user.level || 0,
        google_uid: user.google_uid || null,
        line_uid: user.line_uid || null,
        photo_url: user.photo_url || '',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60) // 2天后过期
      }
    })
  } catch (error) {
    // 捕獲所有其他錯誤並返回
    console.error('登入錯誤:', error)
    return res.status(500).json({
      status: 'error',
      message: '伺服器錯誤',
      detail: error.message
    })
  }
})


router.post('/logout', authenticate, (req, res) => {
  // 清除cookie，確保參數與設置時一致
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    domain: 'localhost' // 添加 domain 參數
  })
  res.json({ status: 'success', data: null })
})

// 註解：使用統一的 authenticate 中間件
// router.post('/status', authenticate, (req, res) => {
//   const user = req.user
//   if (user) {
//     res.json({
//       status: 'token ok',
//       user,
//     })
//   } else {
//     res.status(401).json({
//       status: 'error',
//       message: '請登入',
//     })
//   }
// })

export default router

// 註解：重複的 checkToken 函數已移除，統一使用 authenticate 中間件
// function checkToken(req, res, next) {
//   const token = req.get('Authorization')

//   if (token) {
//     jsonwebtoken.verify(token, accessTokenSecret, (err, decoded) => {
//       if (err) {
//         return res
//           .status(401)
//           .json({ status: 'error', message: '登入驗證失效，請重新登入。' })
//       } else {
//         req.decoded = decoded
//         next()
//       }
//     })
//   } else {
//     return res
//       .status(401)
//       .json({ status: 'error', message: '無登入驗證資料，請重新登入。' })
//   }
// }

// 用 POST 來處理 logout 行為是因為 RESTful API 的設計原則建議將「變更狀態」或「造成副作用」的操作用 POST、PUT、DELETE 等方法，而 GET 是用來取得資源、不應該改變伺服器的狀態。

// 在 logout 的情況下，清除 cookies 是一個修改伺服器狀態的操作，符合 POST 的使用原則。雖然從使用者角度來看只是按了一個按鈕，但背後的動作其實涉及狀態變更。
