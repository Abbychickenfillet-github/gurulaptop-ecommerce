import express from 'express'
const router = express.Router()
import pool from '##/configs/pgClient.js'
// import db from '##/configs/mysql.js'

import multer from 'multer'
const upload = multer()

/* GET home page. */
router.get('/', upload.none(), async (req, res, next) => {
  const coupon_id = req.params.coupon_id
  console.log(coupon_id)
  const { rows } = await pool.query('SELECT * FROM coupon WHERE valid = 1')
  if (rows.length === 0) {
    return res.json({ status: 'error', message: '查無此優惠券' })
  }

  res.json({ status: 'success', data: { rows } })
})

router.get(
  '/add/:user_id/:coupon_id',
  upload.none(),
  async (req, res, next) => {
    const { user_id, coupon_id } = req.params
    const { rows } = await pool.query(
      'INSERT INTO coupon_user (user_id, coupon_id) VALUES ($1, $2)',
      [user_id, coupon_id]
    )
    res.json({ status: 'success', message: '已成功加入優惠券' })
  }
)

export default router
