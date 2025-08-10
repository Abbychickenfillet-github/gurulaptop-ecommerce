import express from 'express'
const router = express.Router()
// import db from '##/configs/mysql.js'
import pool from '##/configs/pgClient.js'
import multer from 'multer'
const upload = multer()

/* GET home page. */
router.put('/', upload.none(), async (req, res, next) => {
  const { order_id } = req.body
  const { rowCount } = await pool.query(
    'UPDATE order_list SET already_pay = 1 WHERE order_id = $1',
    [order_id]
  )
  if (rowCount === 0) {
    return res.status(404).json({ status: 'error', message: '訂單不存在' })
  }
  res.json({ status: 'success', message: '已付款成功' })
})

export default router
