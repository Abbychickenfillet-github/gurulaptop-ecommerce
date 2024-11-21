import express from 'express'
import db from '##/configs/mysql.js'
const router = express.Router()
// 取得單一產品概略資料和圖片路徑
router.get('/card/:product_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT product_name,model,list_price,product_img_path FROM product LEFT JOIN product_img ON product_id = img_product_id WHERE product_id = ? AND valid = 1',
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
//用篩選條件取得商品列表和分頁並回傳有多少頁數
router.get('/list', async (req, res) => {
  try {
    const { page = 1, category, category_value, price, search } = req.query
    const limit = 12
    const offset = (page - 1) * limit
    const where = []
    const params = []

    // 檢查是否有篩選條件
    if (category && category_value) {
      switch (category) {
        case 'product_brand':
          where.push('product_brand LIKE ?')
          params.push(`%${category_value}%`)
          break
        case 'affordance':
          where.push('affordance LIKE ?')
          params.push(`%${category_value}%`)
          break
        case 'product_size':
          where.push('product_size LIKE ?')
          params.push(`%${category_value}%`)
          break
        case 'product_display_card':
          where.push('product_display_card LIKE ?')
          params.push(`%${category_value}%`)
          break
        case 'product_CPU':
          where.push('product_CPU LIKE ?')
          params.push(`%${category_value}%`)
          break
        case 'product_RAM':
          where.push('product_RAM LIKE ?')
          params.push(`%${category_value}%`)
          break
        case 'product_hardisk_volume':
          where.push('product_hardisk_volume LIKE ?')
          params.push(`%${category_value}%`)
          break
      }
    }

    if (search) {
      where.push('product_name LIKE ?')
      params.push(`%${search}%`)
    }

    if (price) {
      const [min, max] = price.split('-')
      where.push('list_price BETWEEN ? AND ?')
      params.push(min, max)
    }

    //用valid = 1 判斷是否上架
    where.push('valid = 1')


    // 如果沒有篩選條件，則設置 WHERE 條件為空字串，否則使用 AND 連接條件
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''

    // 計算符合條件的商品總數
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM product ${whereClause}`,
      params
    )
    const totalProducts = countResult[0].total
    const totalPages = Math.ceil(totalProducts / limit)

    // 查詢符合條件的商品列表
    const [rows] = await db.query(
      `SELECT product_id FROM product ${whereClause} ORDER BY product_id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )
    const products = rows

    if (!products.length) {
      return res.json({ status: 'error', message: '找不到商品' })
    }

    return res.json({
      status: 'success',
      data: {
        products,
        totalPages,
      },
    })
  } catch (error) {
    console.error('取得商品列表失敗:', error)
    return res.json({ status: 'error', message: '取得商品列表失敗' })
  }
})

// 取得單一產品詳細資料和圖片路徑
router.get('/:product_id', async (req, res) => {
  try {
    const product_detail = (
      await db.query(
        'SELECT * FROM product WHERE product_id = ? AND valid = 1',
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

// 取得相關產品
router.get('/related/:product_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT product_name,affordance,product_brand FROM product WHERE product_id = ? AND valid = 1',
      req.params.product_id
    )
    const product_detail = rows[0]
    if (!product_detail) {
      return res.json({ status: 'error', message: '找不到產品' })
    }
    const fuzzyName = `%${product_detail.product_name}%`
    const [related_products] = await db.query(
      'SELECT product_id FROM product WHERE  (product_name LIKE ? OR product_brand LIKE ? OR affordance LIKE ?) AND product_id != ?  AND valid = 1',
      [
        fuzzyName,
        product_detail.product_brand,
        product_detail.affordance,
        req.params.product_id,
      ]
    )
    if (!related_products.length) {
      return res.json({ status: 'error', message: '找不到相關產品' })
    } else {
      // 隨機取得相關產品
      const randomRelatedProducts = related_products
        .sort(() => 0.5 - Math.random())
        .slice(0, 4)

      return res.json({ status: 'success', data: { randomRelatedProducts } })
    }
  } catch (error) {
    console.error('取得相關產品失敗:', error)
    return res.json({ status: 'error', message: '取得相關產品失敗' })
  }
})

export default router
