import express from 'express'
const router = express.Router()
import db from '##/configs/mysql.js'
import multer from 'multer'
const upload = multer()

router.post(
  '/add', // 改用 POST，路徑可以簡化
  upload.none(),
  async (req, res, next) => {
    try {
      // 從請求體獲取數據，而不是從 URL 參數
      const { user_id, coupon_id } = req.body

      // 基本的資料驗證
      if (!user_id || !coupon_id) {
        return res.status(400).json({
          status: 'error',
          message: '缺少必要參數',
        })
      }

      // 檢查優惠券是否已被領取
      const [existingCoupons] = await db.query(
        'SELECT * FROM coupon_user WHERE user_id = ? AND coupon_id = ?',
        [user_id, coupon_id]
      )

      if (existingCoupons.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: '您已經領取過這張優惠券',
        })
      }

      // 新增優惠券
      const [result] = await db.query(
        'INSERT INTO coupon_user (user_id, coupon_id) VALUES (?, ?)',
        [user_id, coupon_id]
      )

      // 成功回應
      res.json({
        status: 'success',
        message: '已成功加入優惠券',
        data: {
          user_id,
          coupon_id,
          created_at: new Date(),
        },
      })
    } catch (error) {
      // 錯誤處理
      console.error('優惠券領取錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試',
      })
    }
  }
)

export default router
