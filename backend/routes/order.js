import express from 'express'
const router = express.Router()

import db from '##/configs/mysql.js'

import multer from 'multer'
const upload = multer()

/* GET home page. */
router.put('/', upload.none(), async (req, res, next) => {
  const { order_id } = req.body
  const [data] = await db.query(
    'UPDATE order_list SET already_pay = 1 WHERE order_id = ?',
    [order_id]
  )
  res.json({ status: 'success', message: '已付款成功', data })
})

export default router
