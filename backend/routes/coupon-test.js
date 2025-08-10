import express from 'express'
import multer from 'multer'
import pool from '../configs/pgClient.js'

const router = express.Router()
const upload = multer()

// 測試優惠券路由
router.get('/', upload.none(), async (req, res, next) => {
  try {
    // 原始程式有 req.params.coupon_id 但未使用
    // 建議修正為實際使用的查詢邏輯
    const { rows: data } = await pool.query('SELECT * FROM test;')

    if (data.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '查無此優惠券'
      })
    }

    res.json({
      status: 'success',
      data
    })
  } catch (error) {
    console.error('優惠券查詢錯誤:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || '伺服器錯誤'
    })
  }
})

export default router