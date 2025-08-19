// backend/routes/user.js
import express from 'express'
import pool from '../db/pgClient.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).send('資料庫錯誤')
  }
})

export default router
