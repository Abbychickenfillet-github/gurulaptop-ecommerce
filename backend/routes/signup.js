import express from 'express'
import db from '##/configs/mysql.js'
import multer from 'multer'
const upload = multer()
const router = express.Router()
import { generateHash } from '#db-helpers/password-hash.js'

router.post('/', upload.none(), async (req, res, next) => {
  try {
    const { email, password, phone, birthdate, gender } = req.body

    // 2. 看解構後的值
    console.log('解構後的值:', {
      email,
      password,
      phone,
      birthdate,
      gender,
    })

    // 3. 特別檢查 password
    // console.log('password 型別:', typeof password)
    // console.log('password 長度:', password ? password.length : 'undefined')

    if (!password) {
      throw new Error('密碼未接收到')
    }

    // 4. 看要執行的 SQL 值
    // console.log('準備插入的值:', [email, password, phone, birthdate, gender])
    // 檢查是否已經有相同的email
    // console.log('開始資料庫操作')

    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )
    // 為什麼這邊是SELECT 1?在這個查詢中,使用SELECT 1而不是SELECT *是一種常見的優化技巧。它的目的是檢查是否存在符合條件的記錄,而不關心記錄的具體內容。

    if (existingUsers.length > 0) {
      return res.json({
        status: 'error',
        message: '電子郵件已被註冊!!!請使用其他email',
      })
    }
    // 確認
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
    const params = [
      email,
      hashedPassword, // 使用加密後的密碼
      phone || null,
      birthdate || null,
      gender === '' ? null : gender,  // 明確檢查空字串
    ]

    const [result] = await db.query(sql, params)
    console.log('插入結果:', result)

    if (result.affectedRows === 1) {
      // 成功插入
      return res.json({
        status: 'success',
        message: '註冊成功',
        data: {
          user_id: result.insertId,
        },
      })
    }
    //   const connection = await db.getConnection()
    //   console.log('Database connection successful')
    //   connection.release()
    //   throw new Error('資料插入失敗')

    // } catch (error) {
    //   console.error('註冊失敗:', error)
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: '此 email 已被註冊...',
      })
    }

    return res.status(500).json({
      status: 'error',
      message: '系統錯誤，請稍後再試',
    })
  }
})

export default router
