import express from 'express'
import multer from 'multer'
import pool from '##/configs/pgClient.js'
import jsonwebtoken from 'jsonwebtoken'
import authenticate from '../middlewares/authenticate.js'
import 'dotenv/config.js'
import { compareHash, generateHash } from '../db-helpers/password-hash.js'

const router = express.Router()
const upload = multer()
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

// 檢查登入狀態
router.get('/check', authenticate, async (req, res) => {
  try {
    const { rows: [user] } = await pool.query(
      'SELECT * FROM users WHERE user_id = $1;',
      [req.user.user_id]
    )

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '找不到使用者'
      })
    }

    // 移除敏感資料
    const { password, ...userWithoutPassword } = user
    return res.json({
      status: 'success',
      data: { user: userWithoutPassword }
    })
  } catch (error) {
    console.error('檢查失敗:', error)
    return res.status(500).json({
      status: 'error',
      message: '檢查失敗'
    })
  }
})

// 註冊
router.post('/', upload.none(), async (req, res) => {
  try {
    const { email, password, phone, birthdate, gender } = req.body

    // 基本驗證
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要欄位'
      })
    }

    // 檢查 email 是否已存在
    const { rows: existingUsers } = await pool.query(
      'SELECT 1 FROM users WHERE email = $1;',
      [email]
    )

    if (existingUsers.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: '電子郵件已被註冊'
      })
    }

    // 密碼加密
    const hashedPassword = await generateHash(password)

    const { rows: [newUser] } = await pool.query(`
      INSERT INTO users (
        email, password, phone, birthdate, gender,
        level, valid, created_at,
        country, city, district, road_name, detailed_address
      ) VALUES (
        $1, $2, $3, $4, $5,
        0, TRUE, NOW(),
        '', '', '', '', ''
      ) RETURNING *;
    `, [email, hashedPassword, phone, birthdate || null, gender])

    if (!newUser) {
      throw new Error('資料插入失敗')
    }

    return res.json({
      status: 'success',
      message: '註冊成功',
      data: { user_id: newUser.user_id }
    })
  } catch (error) {
    console.error('註冊失敗:', error)

    // PostgreSQL 的唯一鍵錯誤碼
    if (error.code === '23505') {
      return res.status(400).json({
        status: 'error',
        message: '此 email 已被註冊'
      })
    }

    return res.status(500).json({
      status: 'error',
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 登入
router.post('/login', upload.none(), async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: '缺少必要資料'
    })
  }

  try {
    const { rows: [user] } = await pool.query(
      'SELECT * FROM users WHERE email = $1;',
      [email]
    )

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: '帳號或密碼錯誤'
      })
    }

    const passwordMatch = await compareHash(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({
        status: 'error',
        message: '帳號或密碼錯誤'
      })
    }

    const tokenData = {
      user_id: user.user_id,
      email: user.email,
      city: user.city
    }

    const accessToken = jsonwebtoken.sign(tokenData, accessTokenSecret, {
      expiresIn: '3d'
    })

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
    })

    return res.json({
      status: 'success',
      data: { accessToken },
      message: '登入成功'
    })
  } catch (error) {
    console.error('登入失敗:', error)
    return res.status(500).json({
      status: 'error',
      message: '登入失敗'
    })
  }
})

// 登出
router.post('/logout', authenticate, (req, res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })
  return res.json({
    status: 'success',
    message: '登出成功'
  })
})

// 身份驗證中間件
export const checkAuth = (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: '請先登入'
      })
    }

    const decoded = jsonwebtoken.verify(token, accessTokenSecret)
    req.user = decoded
    next()
  } catch (error) {
    console.error('認證錯誤:', error)
    return res.status(401).json({
      status: 'error',
      message: '認證失敗，請重新登入'
    })
  }
}

export default router