import express from 'express'
import pool from '../configs/pgClient.js'
import multer from 'multer'

const router = express.Router()
const upload = multer()

// 獲取所有有效的優惠券資訊
router.get('/', async (req, res) => {
  try {
    const { rows: coupons } = await pool.query(`
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
      ORDER BY coupon_id ASC
    `)

    if (coupons.length === 0) {
      return res.json({
        status: 'success',
        data: { coupons },
        message: '目前沒有可用的優惠券'
      })
    }

    res.json({
      status: 'success',
      data: { coupons }
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤'
    })
  }
})

// 獲取特定優惠券資訊
router.get('/:coupon_id', async (req, res) => {
  const { coupon_id } = req.params

  try {
    const { rows: coupons } = await pool.query(`
      SELECT * FROM coupon 
      WHERE coupon_id = $1
    `, [coupon_id])

    if (coupons.length === 0) {
      return res.json({
        status: 'success',
        data: { coupon: null },
        message: '找不到該優惠券'
      })
    }

    res.json({
      status: 'success',
      data: { coupon: coupons[0] }
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤'
    })
  }
})

// 更新優惠券狀態（已取消註解並轉換）
router.put('/update', async (req, res) => {
  try {
    const { coupon_id } = req.body

    if (!coupon_id) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要參數',
        receivedData: req.body
      })
    }

    const { rows: [coupon] } = await pool.query(`
      UPDATE coupon 
      SET valid = FALSE 
      WHERE coupon_id = $1 
      RETURNING *
    `, [coupon_id])

    if (!coupon) {
      return res.status(400).json({
        status: 'error',
        message: '更新失敗，找不到優惠券'
      })
    }

    res.json({
      status: 'success',
      message: '優惠券已標記為已領取',
      data: {
        coupon_id,
        valid: false,
        updated_at: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('詳細錯誤信息:', error)
    res.status(500).json({
      status: 'error',
      message: '系統錯誤'
    })
  }
})

export default router