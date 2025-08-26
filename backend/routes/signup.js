import express from 'express'
import pool from '##/configs/pgClient.js' // ✅ 使用PostgreSQL配置
import multer from 'multer'
const upload = multer()
const router = express.Router()
import { generateHash } from '#db-helpers/password-hash.js'

router.post('/', upload.none(), async (req, res) => {
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

    const { rows: existingUsers } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    if (existingUsers.length > 0) {
      return res.json({
        status: 'error',
        message: '電子郵件已被註冊!!!請使用其他email',
      })
    }

    const hashedPassword = await generateHash(password)
    // 處理空值，確保 PostgreSQL 接受有效值
    const userPhone = phone || null;
    const userBirthdate = birthdate === '' ? null : birthdate;
    const userGender = gender === '' ? null : gender;
    const sql = `
      INSERT INTO users (
        email, password, phone, birthdate, gender,
        level, valid, created_at,
        country, city, district, road_name, detailed_address, image_path
      ) VALUES (
        $1, $2, $3, $4, $5,
        0, TRUE, CURRENT_TIMESTAMP,
        NULL, NULL, NULL, NULL, NULL, NULL
      ) RETURNING user_id
    `

    const params = [
      email,
      hashedPassword,
      userPhone,
      userBirthdate,
      userGender,
    ]

    const { rows } = await pool.query(sql, params)
    console.log('插入結果:', rows[0])

    if (rows.length > 0) {
      // 成功插入
      return res.json({
        status: 'success',
        message: '註冊成功',
        data: {
          user_id: rows[0].user_id,
        },
      })
    }

    // 如果沒有 rows，可能是插入失敗
    return res.status(500).json({
      status: 'error',
      message: '資料庫寫入失敗',
    });
  } catch (error) {
    if (error.code === '23505') { // ✅ PostgreSQL 的唯一约束冲突错误码
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