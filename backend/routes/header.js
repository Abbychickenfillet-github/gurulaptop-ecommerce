import express from 'express'
const router = express.Router()

import pool from '##/configs/pgClient.js' // 修改数据库配置导入路径
import multer from 'multer'

const upload = multer()

/* GET home page. */
router.post('/', upload.none(), async (req, res, next) => {
  const { user_id } = req.body
  const { rows } = await pool.query(
    `SELECT image_path FROM users WHERE user_id = $1`, // 使用 PostgreSQL 参数占位符
    [user_id]
  )
  const data = rows[0] // 访问 PostgreSQL 查询结果的 rows 属性
  res.json(data)
})

export default router