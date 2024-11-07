import express from 'express'
const router = express.Router()
import db from '##/configs/mysql.js'
import multer from 'multer'

const upload = multer()

router.get('/user/:user_id', async (req, res) => {
  try {
    const user_id = parseInt(req.params.user_id)

    if (isNaN(user_id) || user_id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: '無效的用戶編號',
      })
    }

    const [coupons] = await db.query(
      `
      SELECT 
        cu.*,
        c.coupon_code,
        c.coupon_content,
        c.discount_method,
        c.coupon_discount,
        c.coupon_start_time,
        c.coupon_end_time,
        c.valid as coupon_valid
      FROM coupon_user cu
      JOIN coupon c ON cu.coupon_id = c.coupon_id
      WHERE cu.user_id = ?
      ORDER BY cu.id DESC`,
      [user_id]
    )

    if (coupons.length === 0) {
      return res.json({
        status: 'success',
        data: [],
        message: '目前沒有優惠券',
      })
    }

    res.json({
      status: 'success',
      data: coupons,
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤',
    })
  }
})

export default router
