import express from 'express'
import multer from 'multer'
import pool from '##/configs/pgClient.js'
const router = express.Router()
const upload = multer()

// 簡單的 token 驗證函數
const verifyToken = (req) => {
  const token = req.cookies.accessToken
  if (!token) {
    return null
  }
  
  try {
    // 這裡可以添加 JWT 驗證邏輯
    // 暫時簡單檢查 token 是否存在
    return token
  } catch (error) {
    return null
  }
}

/* GET home page. */
router.get('/:user_id', upload.none(), async (req, res, next) => {
  const { user_id } = req.params
  const { status } = req.query

  // 檢查user_id是否存在
  if (!user_id) {
    return res.status(401).json({
      status: 'error',
      message: '請先登入'
    })
  }

  // 簡單的 token 檢查
  const token = verifyToken(req)
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: '請先登入'
    })
  }

  try {
    // 檢查使用者是否存在
    const { rows: users } = await pool.query(
      'SELECT * FROM users WHERE user_id = $1;',
      [user_id]
    )
    
    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '使用者不存在'
      })
    }

    // 根據狀態篩選訂單
    let query = 'SELECT * FROM order_list WHERE user_id = $1'
    let params = [user_id]
    
    if (status === 'processing') {
      query += ' AND already_pay = FALSE'
    } else if (status === 'completed') {
      query += ' AND already_pay = TRUE'
    }

    const { rows: data } = await pool.query(query, params)

    if (data.length === 0) {
      return res.json({
        status: 'success',
        message: '無訂單資料'
      })
    }

    return res.json({
      status: 'success',
      data,
      clause: status
    })
  } catch (error) {
    console.error('Order query error:', error)
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤'
    })
  }
})

// 訂單明細
router.get('/detail/:order_id', upload.none(), async (req, res, next) => {
  const { order_id } = req.params

  try {
    // 簡單的 token 檢查
    const token = verifyToken(req)
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: '請先登入'
      })
    }
    const { rows: result } = await pool.query(`
      SELECT 
        od.*,
        p.product_name,
        p.list_price,
        pi.product_img_path
      FROM order_detail od
      JOIN product p ON od.product_id = p.product_id
      JOIN product_img pi ON p.product_id = pi.img_product_id
      WHERE od.order_id = $1;
    `, [order_id])

    if (result.length === 0) {
      return res.json({
        status: 'success',
        message: '無訂單資料'
      })
    }

    res.json({
      status: 'success',
      data: result
    })
  } catch (error) {
    console.error('Order detail error:', error)
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤'
    })
  }
})

export default router