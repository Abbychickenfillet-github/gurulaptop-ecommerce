import express from 'express'
const router = express.Router()
import multer from 'multer'
import db from '../configs/mysql.js'
import jsonwebtoken from 'jsonwebtoken'
import authenticate from '../middlewares/authenticate.js'
import 'dotenv/config.js'
import { compareHash, generateHash } from '../db-helpers/password-hash.js'
const upload = multer()

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

// seeion? -> 真的? 隔一段時間丟進伺服器做驗證
// 檢查登入狀態 每次一打開頁面
router.get('/check', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE user_id=?', [
      req.user.user_id,
    ])
    if (!rows.length) {
      return res.status(404).json({ status: 'error', message: '找不到使用者' })
    }
    const user = rows[0]
    delete user.password
    return res.json({ status: 'success', data: { user } })
  } catch (error) {
    console.error('檢查失敗:', error)
    return res.status(500).json({ status: 'error', message: '檢查失敗' })
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
        message: '缺少必要欄位',
      })
    }

    // 檢查是否已經有相同的 email
    const [existingUsers] = await db.query(
      'SELECT 1 FROM users WHERE email = ?',
      [email]
    )

    if (existingUsers.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: '電子郵件已被註冊',
      })
    }

    // 密碼加密
    const hashedPassword = await generateHash(password)

    const sql = `
      INSERT INTO users (
        email, password, phone, birthdate, gender,
        level, valid, created_at,
        country, city, district, road_name, detailed_address
      ) VALUES (
        ?, ?, ?, ?, ?,
        0, 1, NOW(),
        '', '', '', '', ''
      )
    `
    const params = [email, hashedPassword, phone, birthdate || null, gender]

    const [result] = await db.query(sql, params)

    if (result.affectedRows === 1) {
      return res.json({
        status: 'success',
        message: '註冊成功',
        data: {
          user_id: result.insertId,
        },
      })
    }

    throw new Error('資料插入失敗')
  } catch (error) {
    console.error('註冊失敗:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: '此 email 已被註冊',
      })
    }

    return res.status(500).json({
      status: 'error',
      message: '系統錯誤，請稍後再試',
    })
  }
})

// 登入
router.post('/login', upload.none(), async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: '缺少必要資料' })
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [
      email,
    ])

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ status: 'error', message: '帳號或密碼錯誤' })
    }

    const user = rows[0]
    const passwordMatch = await compareHash(password, user.password)

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ status: 'error', message: '帳號或密碼錯誤' })
    }

    const tokenData = {
      user_id: user.user_id,
      email: user.email,
      city: user.city,
    }

    const accessToken = jsonwebtoken.sign(tokenData, accessTokenSecret, {
      expiresIn: '3d',
    })

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    })

    return res.json({
      status: 'success',
      data: { accessToken, message: '登入成功' },
    })
  } catch (error) {
    console.error('登入失敗:', error)
    return res.status(500).json({ status: 'error', message: '登入失敗' })
  }
})

// 登出
router.post('/logout', authenticate, (req, res) => {
  res.clearCookie('accessToken')
  return res.json({ status: 'success', message: '登出成功' })
})

// 身份驗證中間件
export const checkAuth = (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(' ')[1] || req.cookies.accessToken

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: '請先登入',
      })
    }

    const decoded = jsonwebtoken.verify(token, accessTokenSecret)
    req.user = decoded
    next()
  } catch (error) {
    console.error('認證錯誤:', error)
    return res.status(401).json({
      status: 'error',
      message: '認證失敗，請重新登入',
    })
  }
}

export default router
