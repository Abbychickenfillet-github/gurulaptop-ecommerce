import express from 'express'
import db from '##/configs/mysql.js'
const router = express.Router()

// 取得單一產品概略資料和圖片路徑
router.get('/card/:product_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT product_name,model,list_price,product_img_path FROM product LEFT JOIN product_img ON product_id = img_product_id WHERE product_id = ?',
      req.params.product_id
    )
    const product = rows[0]
    if (!product) {
      return res.json({ status: 'error', message: '找不到產品' })
    }
    return res.json({ status: 'success', data: { product } })
  } catch (error) {
    console.error('取得產品失敗:', error)
    return res.json({ status: 'error', message: '取得產品失敗' })
  }
})

// 取得單一產品詳細資料和圖片路徑
router.get('/:product_id', async (req, res) => {
  try {
    const product_detail = (
      await db.query(
        'SELECT * FROM product WHERE product_id = ?',
        req.params.product_id
      )
    )[0][0]
    const product_img = (
      await db.query(
        'SELECT product_img_path FROM product_img WHERE img_product_id = ?',
        req.params.product_id
      )
    )[0]
    const product_detail_img = (
      await db.query(
        'SELECT product_img_path FROM product_detail_img WHERE img_product_id = ?',
        req.params.product_id
      )
    )[0]
    const product = { ...product_detail, product_img, product_detail_img }
    if (!product_detail) {
      return res.json({ status: 'error', message: '找不到產品' })
    }
    return res.json({ status: 'success', data: { product } })
  } catch (error) {
    console.error('取得產品失敗:', error)
    return res.json({ status: 'error', message: '取得產品失敗' })
  }
})

export default router
