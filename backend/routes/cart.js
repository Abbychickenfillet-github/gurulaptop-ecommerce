import express from 'express'
import multer from 'multer'
import pool from '##/configs/pgClient.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()
const upload = multer()

// 取得購物車資料
router.post('/', upload.none(), async (req, res, next) => {
  const { user_id } = req.body

  try {
    const { rows: data } = await pool.query(`
      SELECT 
        c.id, c.user_id, c.product_id, c.quantity,
        p.product_name, p.list_price,
        pi.product_img_path
      FROM cart c
      JOIN product p ON c.product_id = p.product_id
      JOIN product_img pi ON c.product_id = pi.img_product_id
      WHERE c.user_id = $1
    `, [user_id])

    if (data.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '購物車目前沒有商品'
      })
    }

    res.json({
      status: 'success',
      data
    })
  } catch (error) {
    console.error('購物車查詢錯誤:', error)
    next(error)
  }
})

// 新增購物車商品
router.put('/add', upload.none(), async (req, res, next) => {
  const { user_id, product_id, quantity } = req.body

  try {
    const { rows: cartCheck } = await pool.query(
      'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
      [user_id, product_id]
    )

    if (cartCheck.length > 0) {
      const newQuantity = parseInt(quantity) + parseInt(cartCheck[0].quantity)
      
      const { rows: [updated] } = await pool.query(
        'UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
        [newQuantity, user_id, product_id]
      )

      return res.json({
        status: 'success',
        message: '已成功加入購物車',
        data: updated
      })
    }

    const { rows: [newItem] } = await pool.query(
      'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [user_id, product_id, quantity]
    )

    res.json({
      status: 'success',
      message: '加入購物車成功',
      data: newItem
    })
  } catch (error) {
    console.error('新增購物車錯誤:', error)
    res.status(500).json({
      status: 'error',
      message: '加入購物車失敗'
    })
  }
})

// 刪除購物車商品
router.delete('/delete', upload.none(), async (req, res, next) => {
  const { user_id, product_id } = req.body

  try {
    const { rows: [deletedItem] } = await pool.query(
      'DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [user_id, product_id]
    )

    if (!deletedItem) {
      return res.status(404).json({
        status: 'error',
        message: '購物車沒有此商品'
      })
    }

    res.json({
      status: 'success',
      message: '已成功刪除購物車商品',
      data: deletedItem
    })
  } catch (error) {
    console.error('刪除購物車錯誤:', error)
    res.status(500).json({
      status: 'error',
      message: '刪除購物車商品失敗'
    })
  }
})

// 更新購物車數量
router.post('/update', upload.none(), async (req, res, next) => {
  const { user_id, product_id, quantity } = req.body

  try {
    const { rows: cartCheck } = await pool.query(
      'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
      [user_id, product_id]
    )

    if (cartCheck.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '購物車沒有此商品'
      })
    }

    if (quantity <= 0) {
      const { rows: [deletedItem] } = await pool.query(
        'DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING *',
        [user_id, product_id]
      )
      return res.json({
        status: 'success',
        message: '已成功刪除購物車商品',
        data: deletedItem
      })
    }

    const { rows: [updatedItem] } = await pool.query(
      'UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
      [quantity, user_id, product_id]
    )

    res.json({
      status: 'success',
      message: '已成功更新購物車商品數量',
      data: updatedItem
    })
  } catch (error) {
    console.error('更新購物車錯誤:', error)
    res.status(500).json({
      status: 'error',
      message: '更新購物車商品數量失敗'
    })
  }
})

// 建立訂單
router.post('/order', upload.none(), async (req, res, next) => {
  const client = await pool.connect()
  const { 
    user_id, 
    amount, 
    coupon_id, 
    detail, 
    receiver, 
    phone, 
    address, 
    payment_method 
  } = req.body
  const order_id = uuidv4()

  try {
    await client.query('BEGIN')

    if (detail.length === 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        status: 'error',
        message: '訂單內容不能為空'
      })
    }

    // 建立主訂單
    const { rows: [order] } = await client.query(`
      INSERT INTO order_list (
        user_id, order_id, order_amount, coupon_id, payment_method, receiver, phone, address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `, [user_id, order_id, amount, coupon_id, payment_method, receiver, phone, address])

    // 建立明細
    for (const item of detail) {
      await client.query(`
        INSERT INTO order_detail (
          user_id, order_id, product_id, quantity, product_price
        ) VALUES ($1, $2, $3, $4, $5)
      `, [user_id, order_id, item.product_id, item.quantity, item.list_price])
    }

    // 刪除購物車
    await client.query(`
      DELETE FROM cart 
      WHERE user_id = $1
      AND product_id = ANY($2::uuid[])
    `, [user_id, detail.map(item => item.product_id)])

    await client.query('COMMIT')
    
    res.json({
      status: 'success',
      message: `訂單成立成功，訂單編號為${order_id}`,
      order_id,
      address
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('建立訂單錯誤:', error)
    res.status(500).json({
      status: 'error',
      message: '建立訂單失敗'
    })
  } finally {
    client.release()
  }
})

export default router