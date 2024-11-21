import express from 'express'
const router = express.Router()
import db from '##/configs/mysql.js'
import multer from 'multer'

const upload = multer()

// 獲取所有有效的優惠券資訊 (valid=1)，依照 coupon_id 排序
router.get('/', async (req, res) => {
  try {
    // SQL 查詢，加入 ORDER BY coupon_id
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
      ORDER BY coupon_id ASC  /* 依照 ID 順序排列，ASC 是升序（從小到大） */
      `
    )

    // 查無資料的處理
    if (coupons.length === 0) {
      return res.json({
        status: 'success',
        data: {
          coupons: [],
        },
        message: '目前沒有可用的優惠券',
      })
    }

    // 成功回應
    return res.json({
      status: 'success',
      data: {
        coupons: coupons,
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({
      status: 'error',
      message: '伺服器錯誤',
    })
  }
})

// router.put('/update', async (req, res) => {
//   try {
//     const { coupon_id } = req.body

//     // 基本參數驗證
//     if (!coupon_id) {
//       return res.status(400).json({
//         status: 'error',
//         message: '缺少必要參數',
//         receivedData: req.body,
//       })
//     }

//     // 更新 coupon 表的 valid 為 0
//     const [result] = await db.query(
//       `
//       UPDATE coupon
//       SET valid = ?
//       WHERE coupon_id = ?
//       `,
//       [1, coupon_id] // 將 valid 設置為 0，表示已領取
//     )

//     console.log('更新結果:', result)

//     if (result.affectedRows === 0) {
//       return res.status(400).json({
//         status: 'error',
//         message: '更新失敗，找不到優惠券',
//       })
//     }

//     // 回傳成功結果
//     res.json({
//       status: 'success',
//       message: '優惠券已標記為已領取',
//       data: {
//         coupon_id,
//         valid: 0, // 將 valid 設置為 0，表示已領取
//         updated_at: new Date(),
//       },
//     })
//   } catch (error) {
//     console.error('詳細錯誤信息:', error)
//     res.status(500).json({
//       status: 'error',
//       message: '系統錯誤',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     })
//   }
// })

router.get('/:coupon_id', async (req, res) => {
  const coupon_id = req.params.coupon_id

  try {
    const [coupon] = await db.query(
      `
      SELECT * FROM coupon WHERE coupon_id = ?`,
      [coupon_id]
    )

    if (coupon.length === 0) {
      return res.json({
        status: 'success',
        data: {
          coupon: null,
        },
        message: '找不到該優惠券',
      })
    }

    return res.json({
      status: 'success',
      data: {
        coupon: coupon[0],
      },
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
