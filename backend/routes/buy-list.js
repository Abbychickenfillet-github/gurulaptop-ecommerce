import express from 'express'
const router = express.Router()

import db from '##/configs/mysql.js'

import multer from 'multer'
const upload = multer()

/* GET home page. */
router.get('/:user_id', upload.none(), async (req, res, next) => {
  const user_id = req.params.user_id
  const status = req.params.status
  // 檢查user_id是否存在
  if (!user_id) {
    return res.json({ status: 'error', message: '請先登入' })
  }

  const [user] = await db.query('SELECT * FROM users WHERE user_id = ?', [
    user_id,
  ])
  if ([user].length === 0) {
    return res.json({ status: 'error', message: '使用者不存在' })
  }

  try {
    const [data] = await db.query(
      'SELECT * FROM order_list WHERE user_id = ?',
      [user_id]
    )

    if (data.length == 0) {
      return res.json({ status: 'success', message: '無訂單資料' })
    }
    return res.json({ status: 'success', data, clause: status })

    // if (status == 'all-orders') {
    //   const [data] = await db.query(
    //     'SELECT * FROM order_list WHERE user_id = ?',
    //     [user_id]
    //   )

    //   if (data.length == 0) {
    //     return res.json({ status: 'success', message: '無訂單資料' })
    //   }
    //   return res.json({ status: 'success', data, clause: status })
    // }

    // if (status == 'processing') {
    //   const [data] = await db.query(
    //     'SELECT * FROM order_list WHERE user_id = ? AND already_pay = 0',
    //     [user_id]
    //   )

    //   if (data.length == 0) {
    //     return res.json({ status: 'success', message: '無訂單資料' })
    //   }
    //   return res.json({ status: 'success', data, clause: status })
    // }

    // if (status == 'completed') {
    //   const [data] = await db.query(
    //     'SELECT * FROM order_list WHERE user_id = ? AND already_pay = 1',
    //     [user_id]
    //   )

    //   if (data.length == 0) {
    //     return res.json({ status: 'success', message: '無訂單資料' })
    //   }
    //   return res.json({ status: 'success', data, clause: status })
    // }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤',
    })
  }
})

router.get('/detail/:order_id', upload.none(), async (req, res, next) => {
  const order_id = req.params.order_id
  // 檢查user_id是否存在

  try {
    const [result] = await db.query(
      'SELECT order_detail.*, product.product_name, product.list_price, product_img.product_img_path FROM order_detail JOIN product ON order_detail.product_id = product.product_id JOIN product_img ON product.product_id = product_img.img_product_id WHERE order_id = ?',
      [order_id]
    )

    if (result.length == 0) {
      return res.json({ status: 'success', message: '無訂單資料' })
    }

    res.json({ status: 'success', data: result })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤',
    })
  }
})

export default router
