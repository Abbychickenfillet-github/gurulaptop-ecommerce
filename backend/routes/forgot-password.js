import express from 'express'
const router = express.Router()
import transporter from "##/configs/mail.js"
import pool from '##/configs/pgClient.js' // 改為PostgreSQL連接池
import { generateHash } from '../db-helpers/password-hash.js'

function generateTempPassword(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let tempPassword = ''
  for (let i = 0; i < length; i++) {
    tempPassword += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return tempPassword
}

// 忘記密碼請求
router.post('/send', async (req, res) => {
  try {
    const { email } = req.body
    console.log(email)

    // 檢查信箱是否存在
    const { rows: users } = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND valid = true', // 使用PostgreSQL的$1占位符和布林值
      [email]
    )

    if (users.length === 0) {
      return res.status(404).json({ message: '此信箱未註冊' })
    }

    // 生成臨時密碼
    const tempPassword = generateTempPassword()
    const hashedPassword = await generateHash(tempPassword)

    // 更新資料庫中的密碼
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING *', // 使用RETURNING取得更新結果
      [hashedPassword, email]
    )

    if (result.rowCount === 0) { // 使用rowCount替代affectedRows
      return res.status(500).json({
        status: 'error',
        message: '密碼更新失敗'
      })
    }

    // 發送郵件
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: '密碼重置通知',
      html: `
        <h1>密碼重置</h1>
        <p>您的臨時密碼是: <strong>${tempPassword}</strong></p>
        <p>請使用此臨時密碼登入後立即更改您的密碼。</p>
        <p>如果這不是您本人的操作，請立即聯繫我們。</p>
      `
    }

    await transporter.sendMail(mailOptions)

    res.json({ status: 'success', message: '新密碼已發送至您的信箱' })
  } catch (error) {
    console.error('忘記密碼處理錯誤:', error)
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router