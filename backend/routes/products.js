// products.js｜PostgreSQL 版（完整覆蓋 + 區塊註解）
// [匯入] Express 與 PostgreSQL 連線池（pgClient.js）
import express from 'express'
import pool from '##/configs/pgClient.js'
// [Router] 建立產品相關路由
const router = express.Router()
// [API] 取得單一產品卡片資料（名稱/型號/價格/首圖）
router.get('/card/:product_id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT product_name, model, list_price, product_img_path
       FROM product
       LEFT JOIN product_img ON product_id = img_product_id
       WHERE product_id = $1 AND valid = 1`,
      [req.params.product_id]
    )
    const product = rows[0]
    if (!product) return res.json({ status: 'error', message: '找不到產品' })
    return res.json({ status: 'success', data: { product } })
  } catch (error) {
    console.error('取得產品失敗:', error)
    return res.json({ status: 'error', message: '取得產品失敗' })
  }
})
// [API] 以條件過濾 + 分頁回傳商品列表與總頁數
router.get('/list', async (req, res) => {
  try {
    const { page = 1, category, category_value, price, search } = req.query
    const limit = 12
    const offset = (Number(page) - 1) * limit
    // [條件容器] where 子句與參數、索引（對應 $1,$2,...）
    const where = []
    const params = []
    let idx = 1
    // [條件] 類別 + 值：以 ILIKE 做模糊比對
    if (category && category_value) {
      const v = `%${category_value}%`
      switch (category) {
        case 'product_brand':
          where.push(`product_brand ILIKE $${idx++}`); params.push(v); break
        case 'affordance':
          where.push(`affordance ILIKE $${idx++}`); params.push(v); break
        case 'product_size':
          where.push(`product_size ILIKE $${idx++}`); params.push(v); break
        case 'product_display_card':
          where.push(`product_display_card ILIKE $${idx++}`); params.push(v); break
        case 'product_CPU':
          where.push(`product_CPU ILIKE $${idx++}`); params.push(v); break
        case 'product_RAM':
          where.push(`product_RAM ILIKE $${idx++}`); params.push(v); break
        case 'product_hardisk_volume':
          where.push(`product_hardisk_volume ILIKE $${idx++}`); params.push(v); break
      }
    }
    // [條件] 關鍵字搜尋：名稱 ILIKE
    if (search) {
      where.push(`product_name ILIKE $${idx++}`); params.push(`%${search}%`)
    }
    // [條件] 價格區間：BETWEEN
    if (price) {
      const [min, max] = String(price).split('-')
      where.push(`list_price BETWEEN $${idx} AND $${idx + 1}`)
      params.push(Number(min), Number(max))
      idx += 2
    }
    // [條件] 上架判斷（仍維持 = 1，如欄位為 boolean 請改為 = TRUE）
    where.push('valid = 1')
    // [組裝] 產生 WHERE 子句
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''
    // [查總數] 計算符合條件的商品數量（回傳 int）
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM product ${whereClause}`,
      params
    )
    const totalProducts = countRows[0]?.total ?? 0
    const totalPages = Math.ceil(totalProducts / limit)
    // [查列表] 取得當頁商品 id（動態佔位符加入 LIMIT/OFFSET）
    const { rows: productRows } = await pool.query(
      `SELECT product_id
       FROM product
       ${whereClause}
       ORDER BY product_id DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    )
    const products = productRows
    if (!products.length) return res.json({ status: 'error', message: '找不到商品' })
    return res.json({ status: 'success', data: { products, totalPages } })
  } catch (error) {
    console.error('取得商品列表失敗:', error)
    return res.json({ status: 'error', message: '取得商品列表失敗' })
  }
})
// [API] 取得單一產品詳細資料 + 圖片清單
router.get('/:product_id', async (req, res) => {
  try {
    const id = req.params.product_id
    const { rows: detailRows } = await pool.query(
      'SELECT * FROM product WHERE product_id = $1 AND valid = 1',
      [id]
    )
    const product_detail = detailRows[0]
    const { rows: imgRows } = await pool.query(
      'SELECT product_img_path FROM product_img WHERE img_product_id = $1',
      [id]
    )
    const { rows: detailImgRows } = await pool.query(
      'SELECT product_img_path FROM product_detail_img WHERE img_product_id = $1',
      [id]
    )
    if (!product_detail) return res.json({ status: 'error', message: '找不到產品' })
    const product = { ...product_detail, product_img: imgRows, product_detail_img: detailImgRows }
    return res.json({ status: 'success', data: { product } })
  } catch (error) {
    console.error('取得產品失敗:', error)
    return res.json({ status: 'error', message: '取得產品失敗' })
  }
})
// [API] 取得相關產品（名稱/品牌/用途模糊比對，排除自身）
router.get('/related/:product_id', async (req, res) => {
  try {
    const id = req.params.product_id
    const { rows } = await pool.query(
      'SELECT product_name, affordance, product_brand FROM product WHERE product_id = $1 AND valid = 1',
      [id]
    )
    const product_detail = rows[0]
    if (!product_detail) return res.json({ status: 'error', message: '找不到產品' })
    const fuzzyName = `%${product_detail.product_name}%`
    const { rows: related } = await pool.query(
      `SELECT product_id
       FROM product
       WHERE (product_name ILIKE $1 OR product_brand ILIKE $2 OR affordance ILIKE $3)
         AND product_id != $4
         AND valid = 1`,
      [fuzzyName, product_detail.product_brand, product_detail.affordance, id]
    )
    if (!related.length) return res.json({ status: 'error', message: '找不到相關產品' })
    const randomRelatedProducts = related.sort(() => 0.5 - Math.random()).slice(0, 4)
    return res.json({ status: 'success', data: { randomRelatedProducts } })
  } catch (error) {
    console.error('取得相關產品失敗:', error)
    return res.json({ status: 'error', message: '取得相關產品失敗' })
  }
})
// [輸出] 匯出路由供主程式掛載
export default router
