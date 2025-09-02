import express from 'express'
import multer from 'multer'
import pool from '../configs/pgClient.js'
import { generateHash, compareHash } from '../db-helpers/password-hash.js'
import authenticate from '../middlewares/authenticate.js'

const router = express.Router()
const upload = multer()

// 移除 /all 路由 - 這會暴露所有用戶資料，有安全風險
// 如果需要管理員功能，應該建立專門的管理員路由

// 取得特定使用者資料
router.get('/all', authenticate, async function (req, res) {
  try {
    const { user_id, email, password } = req.params
    const { rows: users } = await pool.query(
      'SELECT * FROM users WHERE user_id = $1 AND email = $2 AND password = $3;',
      [user_id, email, password]
    )
    
    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '找不到該用戶'
      })
    }

    res.json({
      status: 'success',
      data: users[0]
    })
  } catch (error) {
    console.error('無法取得資料:', error)
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤'
    })
  }
})

// 更新使用者資料
router.put('/:user_id', authenticate, async (req, res) => {
  try {
    const { user_id } = req.params
    const { 
      name, gender, birthdate, phone, email, country, city, district, road_name, detailed_address, image_path, remarks, valid 
    } = req.body

    const { rows: [updatedUser] } = await pool.query(`
      UPDATE users 
      SET 
        name = $1,
        gender = $2,
        birthdate = $3,
        phone = $4,
        email = $5,
        country = $6,
        city = $7,
        district = $8,
        road_name = $9,
        detailed_address = $10,
        image_path = $11,
        remarks = $12,
        valid = $13
      WHERE user_id = $14
      RETURNING *
    `, [name, gender, birthdate, phone, email, country, city, district, road_name, detailed_address, image_path, remarks, valid, user_id])

    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: '找不到該用戶'
      })
    }

    res.json({
      status: 'success',
      message: '更新成功'
    })
  } catch (error) {
    console.error('更新失敗:', error)
    res.status(500).json({
      status: 'error',
      message: '更新失敗'
    })
  }
})

// 密碼驗證
router.put('/pwdCheck/:user_id', authenticate, async (req, res) => {
  const { user_id } = req.params
  const { currentPassword } = req.body

  try {
    const { rows: users } = await pool.query(
      'SELECT password FROM users WHERE user_id = $1;',
      [user_id]
    )

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '找不到該用戶'
      })
    }

    const isMatch = await compareHash(currentPassword, users[0].password)
    
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: '當前密碼不正確'
      })
    }

    res.status(200).json({
      status: 'pwdmatch',
      message: '用戶在輸入框中輸入之密碼與原始密碼吻合'
    })
  } catch (error) {
    console.error('檢查密碼失敗:', error)
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤'
    })
  }
})

// 密碼重設
router.put('/:user_id/pwdReset', authenticate, async (req, res) => {
  const { user_id } = req.params
  const { newPassword1, newPassword2 } = req.body

  try {
    if (!newPassword1 || !newPassword2) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要參數'
      })
    }

    if (newPassword1 !== newPassword2) {
      return res.status(400).json({
        status: 'error',
        message: '兩次輸入的密碼不一致'
      })
    }

    const hashedPassword = await generateHash(newPassword2)

    const { rows: [updatedUser] } = await pool.query(`
      UPDATE users 
      SET password = $1 
      WHERE user_id = $2
      RETURNING *
    `, [hashedPassword, user_id])

    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: '找不到該用戶'
      })
    }

    res.status(200).json({
      status: 'resetPwd success',
      message: '新密碼更新成功，記得記住新密碼'
    })
  } catch (error) {
    console.error('密碼更新失敗:', error)
    res.status(500).json({
      status: 'error',
      message: '密碼更新失敗'
    })
  }
})

export default router