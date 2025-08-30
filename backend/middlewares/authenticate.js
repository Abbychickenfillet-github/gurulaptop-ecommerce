import jsonwebtoken from 'jsonwebtoken'
import 'dotenv/config.js'

// 獲得加密用字串
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

// 中介軟體middleware，用於檢查授權(authenticate)
// 統一使用 login.js 中的 JWT 邏輯
export default function authenticate(req, res, next) {
  // 優先從 cookie 中獲取 token，其次從 Authorization header
  const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1]

  // 如果沒有 token
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: '授權失敗，沒有存取令牌',
    })
  }

  // 驗證 JWT token
  jsonwebtoken.verify(token, accessTokenSecret, (err, user) => {
    if (err) {
      return res.status(401).json({
        status: 'error',
        message: '不合法的存取令牌',
      })
    }

    // 將用戶資料加到 req 中
    req.user = user
    next()
  })
}
