import express from 'express'
import pool from '../configs/pgClient.js'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import authenticate from '../middlewares/authenticate.js'

const router = express.Router()
const upload = multer()

// 修改新增優惠券路由，使用 userId 參數
router.post('/add/:user_id', authenticate, upload.none(), async (req, res, next) => {
  const client = await pool.connect()
  const { user_id } = req.params
  const { coupon_id } = req.body

  try {
    console.log('=== 優惠券領取請求 ===')
    console.log('URL參數:', req.params)
    console.log('請求內容:', req.body)

    // 參數驗證
    if (!user_id || !coupon_id) {
      return res.status(400).json({
        status: 'error',
        message: '無效的參數',
        data: { user_id, coupon_id },
      })
    }

    // 確保用戶只能為自己領取優惠券
    if (req.user.user_id != user_id) {
      return res.status(403).json({
        status: 'error',
        message: '無權限為其他用戶領取優惠券'
      })
    }

    await client.query('BEGIN')

    // 檢查使用者是否存在且有效
    const { rows: users } = await client.query(
      'SELECT user_id FROM users WHERE user_id = $1',
      [user_id]
    )

    if (users.length === 0) {
      throw new Error('使用者不存在或已被停用')
    }

    // 檢查優惠券是否存在且有效
    const { rows: coupons } = await client.query(
      'SELECT coupon_id FROM coupon WHERE coupon_id = $1 AND valid = TRUE',
      [coupon_id]
    )

    if (coupons.length === 0) {
      throw new Error('優惠券不存在或已失效')
    }

    // 檢查是否已領取
    const { rows: existingCoupons } = await client.query(
      'SELECT id FROM coupon_user WHERE user_id = $1 AND coupon_id = $2',
      [user_id, coupon_id]
    )

    if (existingCoupons.length > 0) {
      throw new Error('您已經領取過這張優惠券')
    }

    // 新增優惠券
    const { rows: [newCoupon] } = await client.query(`
      INSERT INTO coupon_user (
        user_id, coupon_id, valid
      ) VALUES ($1, $2, TRUE)
      RETURNING *;
    `, [user_id, coupon_id])

    await client.query('COMMIT')
    console.log('優惠券領取成功:', newCoupon)

    res.json({
      status: 'success',
      message: '優惠券領取成功',
      data: {
        id: newCoupon.id,
        user_id,
        coupon_id,
        created_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('錯誤詳情:', error)
    res.status(error.message.includes('不存在') ? 400 : 500).json({
      status: 'error',
      message: error.message || '系統錯誤',
    })
  } finally {
    client.release()
  }
})

// 修改取得使用者優惠券路由
router.get('/:user_id', authenticate, async (req, res) => {
  const { user_id } = req.params

  try {
    if (!user_id) {
      return res.status(400).json({
        status: 'error',
        message: '無效的用戶編號',
      })
    }

    // 確保用戶只能查看自己的優惠券
    if (req.user.user_id != user_id) {
      return res.status(403).json({
        status: 'error',
        message: '無權限查看其他用戶的優惠券'
      })
    }

    const { rows: userExists } = await pool.query(
      'SELECT user_id FROM users WHERE user_id = $1',
      [user_id]
    )

    if (userExists.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '用戶不存在或已被停用',
      })
    }

    const { rows: validCoupons } = await pool.query(`
      SELECT 
        cu.id,
        cu.user_id,
        cu.coupon_id,
        cu.valid AS user_coupon_valid,
        c.coupon_code,
        c.coupon_content,
        c.discount_method,
        c.coupon_discount,
        c.coupon_start_time,
        c.coupon_end_time,
        c.valid AS coupon_valid,
        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        u.level AS user_level
      FROM coupon_user cu
      JOIN coupon c ON cu.coupon_id = c.coupon_id
      JOIN users u ON cu.user_id = u.user_id
      WHERE cu.user_id = $1 
      AND cu.valid = TRUE
      ORDER BY cu.id DESC;
    `, [user_id])

    res.json({
      status: 'success',
      data: validCoupons,
      message: validCoupons.length === 0 ? '目前沒有可用的優惠券' : '查詢成功',
    })
  } catch (error) {
    console.error('Error:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({
      status: 'error',
      message: '系統錯誤',
      details: error.message
    })
  }
})

// 修改更新優惠券狀態路由
router.put('/update/:user_id/:coupon_id', async (req, res) => {
  const client = await pool.connect()
  const { user_id, coupon_id } = req.params

  try {
    if (!user_id || !coupon_id) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要參數',
      })
    }

    await client.query('BEGIN')

    const { rows: [result] } = await client.query(`
      UPDATE coupon_user 
      SET valid = FALSE 
      WHERE user_id = $1 AND coupon_id = $2
      RETURNING *;
    `, [user_id, coupon_id])

    if (!result) {
      throw new Error('找不到符合條件的優惠券')
    }

    await client.query('COMMIT')

    res.json({
      status: 'success',
      message: '優惠券狀態已更新',
      data: {
        user_id,
        coupon_id,
        updated_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('錯誤詳情:', error)
    res.status(error.message.includes('找不到') ? 400 : 500).json({
      status: 'error',
      message: error.message || '系統錯誤',
    })
  } finally {
    client.release()
  }
})

export default router