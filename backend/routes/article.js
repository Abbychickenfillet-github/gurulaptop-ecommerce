import express from 'express'
import multer from 'multer'
import pool from '##/configs/pgClient.js'

const router = express.Router()
const upload = multer()

router.get('/article_detail/:article_id', upload.none(), async (req, res, next) => {
  const { article_id } = req.params

  try {
    const { rows: data } = await pool.query(
      'SELECT * FROM articleoverview WHERE article_id = $1;',
      [article_id]
    )

    if (data.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '查無此文章'
      })
    }

    res.json({
      status: 'success',
      data: data
    })
  } catch (error) {
    console.error('文章查詢錯誤:', error)
    next(error)
  }
})

// 新增文章路由示例
router.post('/create', upload.none(), async (req, res, next) => {
  const { title, content, author_id } = req.body

  try {
    const { rows: [newArticle] } = await pool.query(
      'INSERT INTO articleoverview (title, content, author_id) VALUES ($1, $2, $3) RETURNING *;',
      [title, content, author_id]
    )

    res.status(201).json({
      status: 'success',
      data: newArticle
    })
  } catch (error) {
    console.error('建立文章錯誤:', error)
    next(error)
  }
})

export default router