import express from 'express'
import pool from '##/configs/pgClient.js' // 改為PostgreSQL連接池
const router = express.Router()

// 加入收藏
router.put('/:user_id/:product_id', async (req, res) => {
  const { user_id, product_id } = req.params
  try {
    const { rows } = await pool.query(
      'SELECT * FROM "favorite_management" WHERE user_id = $1 AND product_id = $2',
      [user_id, product_id]
    )
    
    if (rows.length > 0) {
      return res.json({ status: 'error', message: '已加入收藏' })
    }
    
    await pool.query(
      'INSERT INTO favorite_management (user_id, product_id) VALUES ($1, $2)',
      [user_id, product_id] // 改為PostgreSQL的VALUES語法
    )
    
    return res.status(200).json({ status: 'success', message: '加入收藏成功' })
  } catch (error) {
    console.error('加入收藏失敗:', error)
    return res.status(500).json({ status: 'error', message: '加入收藏失敗' })
  }
})

// 取得是否已加入收藏
router.get('/:user_id/:product_id', async (req, res) => {
  const { user_id, product_id } = req.params
  try {
    const { rows } = await pool.query(
      'SELECT * FROM favorite_management WHERE user_id = $1 AND product_id = $2',
      [user_id, product_id]
    )
    
    if (rows.length > 0) {
      return res.json({ status: 'success', message: '已加入收藏' })
    }
    
    return res.json({ status: 'error', message: '未加入收藏' })
  } catch (error) {
    console.error('取得是否已加入收藏失敗:', error)
    return res.json({ status: 'error', message: '取得是否已加入收藏失敗' })
  }
})

// 刪除收藏
router.delete('/:user_id/:product_id', async (req, res) => {
  const { user_id, product_id } = req.params
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM favorite_management WHERE user_id = $1 AND product_id = $2',
      [user_id, product_id]
    )
    
    if (rowCount === 0) {
      return res.json({ status: 'error', message: '收藏不存在' })
    }
    
    return res.json({ status: 'success', message: '刪除收藏成功' })
  } catch (error) {
    console.error('刪除收藏失敗:', error)
    return res.json({ status: 'error', message: '刪除收藏失敗' })
  }
})

// 取得收藏清單
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params
  try {
    const { rows } = await pool.query(
      'SELECT * FROM favorite_management WHERE user_id = $1',
      [user_id]
    )
    
    if (!rows.length) {
      return res.json({ status: 'error', message: '找不到收藏清單' })
    }
    
    return res.json({ status: 'success', data: { favorite: rows } })
  } catch (error) {
    console.error('取得收藏清單失敗:', error)
    return res.json({ status: 'error', message: '取得收藏清單失敗' })
  }
})

export default router