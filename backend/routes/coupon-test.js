import express from 'express'
const router = express.Router()
import db from '##/configs/mysql.js'
import multer from 'multer'

const upload = multer()
router.get('/', upload.none(), async (req, res, next) => {
  const coupon_id = req.params.coupon_id
  console.log(coupon_id)
  const [data] = await db.query('SELECT * FROM test ')
  if (data.length == 0) {
    return res.json({ status: 'error', message: '查無此優惠券' })
  }

  res.json({ status: 'success', data: { data } })
})
export default router
