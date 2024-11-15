import express from 'express'
import db from '##/configs/mysql.js'
import multer from 'multer'

const router = express.Router()
const upload = multer()

// 修改新增優惠券路由，使用 userId 參數
router.post('/add/:userId', upload.none(), async (req, res, next) => {
  let connection
  try {
    console.log('=== 優惠券領取請求 ===')
    console.log('URL參數:', req.params)
    console.log('請求內容:', req.body)

    const userId = parseInt(req.params.userId)
    const couponId = parseInt(req.body.coupon_id)

    // 參數驗證
    if (!userId || !couponId) {
      return res.status(400).json({
        status: 'error',
        message: '無效的參數',
        data: { userId, couponId },
      })
    }

    // 取得資料庫連線並開始交易
    connection = await db.getConnection()
    await connection.beginTransaction()

    // 檢查使用者是否存在且有效
    const [users] = await connection.query(
      'SELECT user_id FROM users WHERE user_id = ?',
      [userId]
    )

    if (users.length === 0) {
      throw new Error('使用者不存在或已被停用')
    }

    // 檢查優惠券是否存在且有效
    const [coupons] = await connection.query(
      'SELECT coupon_id FROM coupon WHERE coupon_id = ? AND valid = 1',
      [couponId]
    )

    if (coupons.length === 0) {
      throw new Error('優惠券不存在或已失效')
    }

    // 檢查是否已領取
    const [existingCoupons] = await connection.query(
      'SELECT id FROM coupon_user WHERE user_id = ? AND coupon_id = ?',
      [userId, couponId]
    )

    if (existingCoupons.length > 0) {
      throw new Error('您已經領取過這張優惠券')
    }

    // 新增優惠券
    const [result] = await connection.query(
      'INSERT INTO coupon_user (user_id, coupon_id, valid) VALUES (?, ?, 1)',
      [userId, couponId]
    )

    await connection.commit()
    console.log('優惠券領取成功:', result)

    res.json({
      status: 'success',
      message: '優惠券領取成功',
      data: {
        id: result.insertId,
        user_id: userId,
        coupon_id: couponId,
        created_at: new Date(),
      },
    })
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error('Rollback失敗:', rollbackError)
      }
    }

    console.error('錯誤詳情:', error)
    res.status(error.message.includes('不存在') ? 400 : 500).json({
      status: 'error',
      message: error.message || '系統錯誤',
    })
  } finally {
    if (connection) connection.release()
  }
})

// 修改取得使用者優惠券路由
router.get('/:userId', async (req, res) => {
  let connection
  try {
    const userId = parseInt(req.params.userId)

    if (!userId || userId <= 0) {
      return res.status(400).json({
        status: 'error',
        message: '無效的用戶編號',
      })
    }

    connection = await db.getConnection()

    // 檢查用戶是否存在且有效
    const [userExists] = await connection.query(
      'SELECT user_id FROM users WHERE user_id = ?',
      [userId]
    )

    if (userExists.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '用戶不存在或已被停用',
      })
    }

    // 獲取用戶優惠券
    const [validCoupons] = await connection.query(
      `SELECT 
        cu.id,
        cu.user_id,
        cu.coupon_id,
        cu.valid as user_coupon_valid,
        c.coupon_code,
        c.coupon_content,
        c.discount_method,
        c.coupon_discount,
        c.coupon_start_time,
        c.coupon_end_time,
        c.valid as coupon_valid,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        u.level as user_level
      FROM coupon_user cu
      JOIN coupon c ON cu.coupon_id = c.coupon_id
      JOIN users u ON cu.user_id = u.user_id
      WHERE cu.user_id = ? 
      AND cu.valid = 1
      ORDER BY cu.id DESC`,
      [userId]
    )

    res.json({
      status: 'success',
      data: validCoupons,
      message: validCoupons.length === 0 ? '目前沒有可用的優惠券' : '查詢成功',
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      status: 'error',
      message: '系統錯誤',
    })
  } finally {
    if (connection) connection.release()
  }
})

// 修改更新優惠券狀態路由
router.put('/update/:userId/:coupon_id', async (req, res) => {
  let connection
  try {
    const userId = req.params.userId
    const coupon_id = req.params.coupon_id

    if (!userId || !coupon_id) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要參數',
      })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    const [result] = await connection.query(
      'UPDATE coupon_user SET valid = 0 WHERE user_id = ? AND coupon_id = ?',
      [userId, coupon_id]
    )

    if (result.affectedRows === 0) {
      throw new Error('找不到符合條件的優惠券')
    }

    await connection.commit()

    res.json({
      status: 'success',
      message: '優惠券狀態已更新',
      data: {
        user_id: userId,
        coupon_id,
        updated_at: new Date(),
      },
    })
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error('Rollback失敗:', rollbackError)
      }
    }

    console.error('錯誤詳情:', error)
    res.status(error.message.includes('找不到') ? 400 : 500).json({
      status: 'error',
      message: error.message || '系統錯誤',
    })
  } finally {
    if (connection) connection.release()
  }
})

export default router
