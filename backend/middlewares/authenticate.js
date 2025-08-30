import jsonwebtoken from 'jsonwebtoken'
import 'dotenv/config.js'

// 獲得加密用字串
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

// 中介軟體middleware，用於檢查授權(authenticate)
// 統一使用 login.js 中的 JWT 邏輯
export default function authenticate(req, res, next) {
  console.log('🔐 認證中間件開始執行')
  console.log('🍪 Cookies:', req.cookies)
  console.log('📋 Headers:', req.headers.authorization ? '有 Authorization header' : '無 Authorization header')
  
  // 優先從 cookie 中獲取 token，其次從 Authorization header
  const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1]
  console.log('🎫 Token:', token ? '有 token' : '無 token')

  // 如果沒有 token
  if (!token) {
    console.log('❌ 認證失敗：沒有存取令牌')
    return res.status(401).json({
      status: 'error',
      message: '授權失敗，沒有存取令牌',
    })
  }

  // 驗證 JWT token
  console.log('🔐 開始驗證 JWT token...')
  jsonwebtoken.verify(token, accessTokenSecret, (err, user) => {
    if (err) {
      console.log('❌ JWT 驗證失敗:', err.message)
      return res.status(401).json({
        status: 'error',
        message: '不合法的存取令牌',
      })
    }

    // 將用戶資料加到 req 中
    console.log('✅ JWT 驗證成功，用戶 ID:', user.user_id)
    req.user = user
    next()
  })
}
