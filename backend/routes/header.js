import express from 'express'
const router = express.Router()

import db from '##/configs/mysql.js'
import multer from 'multer'

const upload = multer()

/* GET home page. */
router.post('/', upload.none(), async (req, res, next) => {
  const { user_id } = req.body
  const [result] = await db.query(
    `SELECT image_path FROM users WHERE user_id = ?`,
    [user_id]
  )
  const data = result[0]
  res.json(data)
})

export default router
