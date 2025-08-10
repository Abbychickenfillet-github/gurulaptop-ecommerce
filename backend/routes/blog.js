import express from 'express'
import multer from 'multer'
import pool from '##/configs/pgClient.js'
import { v4, uuidv4 } from 'uuid'

const router = express.Router()

// 後端儲存路徑
const uploadDir = 'public/blog-images'

// 修改 multer 配置
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    // 使用 UUID 生成唯一檔名
    const uniqueSuffix = `${uuidv4()}-${file.originalname}`
    cb(null, uniqueSuffix)
  }
})

const upload = multer({ storage })

// 分頁查詢
router.get('/', async (req, res) => {
  const { page = 1, limit = 2 } = req.query
  const offset = (page - 1) * limit

  try {
    // 獲取總數
    const { rows: [total] } = await pool.query(
      'SELECT COUNT(*) as total FROM blogoverview WHERE blog_valid_value = TRUE;'
    )

    // 獲取分頁資料
    const { rows: blogs } = await pool.query(`
      SELECT * FROM blogoverview 
      WHERE blog_valid_value = TRUE
      ORDER BY blog_created_date DESC 
      LIMIT $1 OFFSET $2;
    `, [parseInt(limit), parseInt(offset)])

    res.json({
      blogs,
      total: total.total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total.total / parseInt(limit))
    })
  } catch (error) {
    console.error('Latest blogs error:', error)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// 博客卡片分頁
router.get('/blogcardgroup', async (req, res) => {
  const { page = 1, limit = 6 } = req.query
  const offset = (page - 1) * limit

  try {
    const { rows: [total] } = await pool.query(
      'SELECT COUNT(*) as total FROM blogoverview WHERE blog_valid_value = TRUE;'
    )

    const { rows: blogs } = await pool.query(`
      SELECT * FROM blogoverview 
      WHERE blog_valid_value = TRUE
      ORDER BY blog_created_date DESC 
      LIMIT $1 OFFSET $2;
    `, [parseInt(limit), parseInt(offset)])

    res.json({
      blogs,
      total: total.total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total.total / parseInt(limit))
    })
  } catch (error) {
    console.error('Latest blogs error:', error)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// 新增部落格
router.post('/blog-created', upload.single('blog_image'), async (req, res) => {
  try {
    const {
      user_id,
      blog_type,
      blog_title,
      blog_content,
      blog_brand,
      blog_brand_model,
      blog_keyword,
      blog_valid_value,
      blog_created_date,
    } = req.body

    const blog_image = req.file ? `/blog-images/${req.file.filename}` : null

    const { rows: [newBlog] } = await pool.query(`
      INSERT INTO blogoverview (
        user_id, blog_type, blog_title, blog_content, blog_brand,
        blog_brand_model, blog_keyword, blog_valid_value, blog_created_date, blog_image
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10
      ) RETURNING *;
    `, [
      user_id,
      blog_type,
      blog_title,
      blog_content,
      blog_brand,
      blog_brand_model,
      blog_keyword,
      blog_valid_value === '1',
      blog_created_date,
      blog_image
    ])

    res.json({
      success: true,
      message: '新增成功',
      blog_id: newBlog.blog_id
    })
  } catch (error) {
    console.error('資料庫錯誤:', error)
    
    // PostgreSQL 唯一鍵錯誤碼
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: '此部落格已存在'
      })
    }

    res.status(500).json({
      success: false,
      message: '新增失敗，請稍後再試'
    })
  }
})

// 查看單一部落格（使用者視角）
router.get('/blog-user-detail/:blog_id', async (req, res) => {
  try {
    const { rows: blogs } = await pool.query(`
      SELECT 
        user_id,
        blog_type,
        blog_title,
        blog_content,
        blog_created_date,
        blog_brand,
        blog_image,
        blog_views,
        blog_keyword,
        blog_valid_value,
        blog_url
      FROM blogoverview
      WHERE blog_valid_value = TRUE AND blog_id = $1;
    `, [req.params.blog_id])

    if (blogs.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '查無相關部落格資料'
      })
    }

    res.json({
      status: 'success',
      data: blogs[0]
    })
  } catch (error) {
    console.error('Error fetching blog data:', error)
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤'
    })
  }
})

// 查看單一部落格（一般）
router.get('/blog-detail/:blog_id', async (req, res) => {
  try {
    const { rows: blogs } = await pool.query(`
      SELECT 
        user_id,
        blog_type,
        blog_title,
        blog_content,
        blog_created_date,
        blog_brand,
        blog_image,
        blog_views,
        blog_keyword,
        blog_valid_value,
        blog_url
      FROM blogoverview
      WHERE blog_valid_value = TRUE AND blog_id = $1;
    `, [req.params.blog_id])

    if (blogs.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '查無相關部落格資料'
      })
    }

    res.json({
      status: 'success',
      data: blogs[0]
    })
  } catch (error) {
    console.error('Error fetching blog data:', error)
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤'
    })
  }
})

// 查看部落格（管理）
router.get('/bloguseroverview/:user_id', async (req, res) => {
  try {
    const { rows: blogs } = await pool.query(`
      SELECT b.*, u.name as user_name 
      FROM blogoverview b
      JOIN users u ON b.user_id = u.user_id
      WHERE b.user_id = $1 AND b.blog_valid_value = TRUE
      ORDER BY b.blog_created_date DESC;
    `, [req.params.user_id])

    if (blogs.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '找不到該文章'
      })
    }

    res.json({
      status: 'success',
      data: blogs
    })
  } catch (error) {
    console.error('部落格查詢錯誤:', error)
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤'
    })
  }
})

// 編輯部落格
router.put('/blog-edit/:blog_id', upload.single('blog_image'), async (req, res) => {
  try {
    const {
      user_id,
      blog_type,
      blog_title,
      blog_content,
      blog_brand,
      blog_brand_model,
      blog_keyword,
      originalImage
    } = req.body

    let blog_image = null
    if (req.file) {
      blog_image = `/blog-images/${req.file.filename}`
    } else if (originalImage) {
      blog_image = originalImage
    }

    const { rows: [updatedBlog] } = await pool.query(`
      UPDATE blogoverview 
      SET user_id = $1,
          blog_type = $2,
          blog_title = $3,
          blog_content = $4,
          blog_brand = $5,
          blog_brand_model = $6,
          blog_keyword = $7,
          blog_image = $8
      WHERE blog_id = $9
      RETURNING *;
    `, [
      user_id,
      blog_type,
      blog_title,
      blog_content,
      blog_brand,
      blog_brand_model,
      blog_keyword,
      blog_image,
      req.params.blog_id
    ])

    res.json({
      success: true,
      blog_image: updatedBlog.blog_image
    })
  } catch (error) {
    console.error('更新錯誤:', error)
    
    // 如果是唯一鍵錯誤
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: '此部落格已存在'
      })
    }

    res.status(500).json({
      success: false,
      message: '更新失敗'
    })
  }
})

// 軟刪除部落格
router.put('/blog-delete/:blog_id', async (req, res) => {
  try {
    const { rows: [blog] } = await pool.query(
      'SELECT blog_image FROM blogoverview WHERE blog_id = $1;',
      [req.params.blog_id]
    )

    // 刪除圖片
    if (blog.blog_image) {
      const imagePath = path.join(__dirname, '..', blog.blog_image)
      try {
        await fs.promises.unlink(imagePath)
      } catch (err) {
        console.error('Error deleting blog image:', err)
      }
    }

    // 執行刪除
    const { rows: [result] } = await pool.query(
      'UPDATE blogoverview SET blog_valid_value = FALSE WHERE blog_id = $1 RETURNING *;',
      [req.params.blog_id]
    )

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('刪除錯誤:', error)
    res.status(500).json({
      success: false,
      message: '刪除失敗'
    })
  }
})

// 查看評論
router.get('/blog-comment/:blog_id', async (req, res) => {
  try {
    const { rows: blogComments } = await pool.query(`
      SELECT 
        bc.*,
        users.name,
        users.image_path
      FROM blogcomment bc
      LEFT JOIN users ON bc.user_id = users.user_id
      WHERE bc.blog_id = $1
      ORDER BY bc.blog_created_date ASC;
    `, [req.params.blog_id])

    res.json(blogComments)
  } catch (error) {
    console.error('部落格查詢錯誤:', error)
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤'
    })
  }
})

// 新增評論
router.post('/blog-comment/:blog_id', async (req, res) => {
  const { blog_id } = req.params
  const { user_id, blog_content, blog_created_date } = req.body

  try {
    const { rows: [newComment] } = await pool.query(`
      INSERT INTO blogcomment 
      (blog_id, user_id, blog_content, blog_created_date) 
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, [blog_id, user_id, blog_content, blog_created_date])

    // 獲取用戶資料
    const { rows: [user] } = await pool.query(
      'SELECT name, image_path FROM users WHERE user_id = $1;',
      [newComment.user_id]
    )

    res.json({
      ...newComment,
      name: user.name,
      image_path: user.image_path
    })
  } catch (error) {
    console.error('新增評論錯誤:', error)
    res.status(500).json({
      status: 'error',
      message: 'Error posting comment'
    })
  }
})

// 搜尋路由
router.get('/search', async (req, res) => {
  const { page = 1, limit = 6, search = '', types = '', brands = '' } = req.query
  const offset = (page - 1) * limit

  try {
    let whereConditions = ['blog_valid_value = TRUE']
    let params = []

    if (search) {
      whereConditions.push('(blog_content ILIKE $1 OR blog_title ILIKE $2)')
      params.push(`%${search}%`, `%${search}%`)
    }

    if (types) {
      const typeArray = types.split(',').filter(Boolean)
      if (typeArray.length) {
        whereConditions.push(`blog_type IN (${typeArray.map(() => '$' + (params.length + 1)).join(',')})`)
        params = params.concat(typeArray)
      }
    }

    if (brands) {
      const brandArray = brands.split(',').filter(Boolean)
      if (brandArray.length) {
        whereConditions.push(`blog_brand IN (${brandArray.map(() => '$' + (params.length + 1)).join(',')})`)
        params = params.concat(brandArray)
      }
    }

    const whereClause = whereConditions.length > 1 ? `WHERE ${whereConditions.join(' AND ')}` : ''
    const paramsWithLimit = [...params, parseInt(limit), parseInt(offset)]

    const [countResult, blogsResult] = await Promise.all([
      pool.query(`SELECT COUNT(*) as total FROM blogoverview ${whereClause};`, params),
      pool.query(`
        SELECT * FROM blogoverview 
        ${whereClause}
        ORDER BY blog_created_date DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2};
      `, paramsWithLimit)
    ])

    res.json({
      blogs: blogsResult.rows,
      total: countResult.rows[0].total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].total / parseInt(limit)),
    })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤'
    })
  }
})

export default router