import express from 'express'
const router = express.Router()
import db from '##/configs/mysql.js'
import multer from 'multer'

const upload = multer()

// 獲取優惠券資訊
router.get('/:coupon_id', async (req, res) => {
  try {
    const coupon_id = parseInt(req.params.coupon_id) // 轉換為數字

    // 驗證優惠券ID
    if (isNaN(coupon_id) || coupon_id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: '無效的優惠券編號',
      })
    }

    // SQL 查詢修正
    const [coupons] = await db.query(
      `
      SELECT 
        coupon_id,
        coupon_code,
        coupon_content,
        discount_method,
        coupon_discount,
        coupon_start_time,
        coupon_end_time,
        valid
      FROM coupon
      WHERE coupon_id = ?
    `,
      [coupon_id]
    )

    // 查無資料的處理
    if (coupons.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '查無此優惠券',
      })
    }

    // 成功回應
    return res.json({
      status: 'success',
      data: coupons[0],
    })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({
      status: 'error',
      message: '伺服器錯誤',
    })
  }
})

export default router
