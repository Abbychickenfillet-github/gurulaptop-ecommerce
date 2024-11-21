import express from 'express'
import db from '##/configs/mysql.js'
import multer from 'multer'

const router = express.Router()
// 指定router變成變數，router是一個方法，處理路由
// 解析傳來的請求，目前我是用 fetch()

// 有撈到了啦 json http://localhost:3005/api/article/1
// 動態路由記得寫

// 把假圖片全部儲存在後端統一路徑
// 後端儲存路徑：public/blog-images
// 後端完整儲存路徑 (不要用)：\laptopGuru\backend\public\blog-images\
// 前端獲取資料路徑：http://localhost:3005/blog-image/

const upload = multer({
  storage: multer.diskStorage({
    destination: 'public/blog-images',
    filename: (req, file, cb) => {
      cb(null, `${file.originalname}`)
    },
  }),
})

// -------------------------------時間戳記製作-------------------------------

// 後端路由
// router.get('/test', async (req, res) => {
//   console.log('apple') // 這會在伺服器控制台顯示 'apple'
//   res.send('Test endpoint is working') // 回應 Postman 字串
// })

router.get('/', async (req, res) => {
  const { page = 1, limit = 2 } = req.query
  const offset = (page - 1) * limit

  try {
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM blogoverview WHERE blog_valid_value = 1'
    )

    const [blogs] = await db.query(
      `SELECT * FROM blogoverview 
       WHERE blog_valid_value = 1
       ORDER BY blog_created_date DESC 
       LIMIT ? OFFSET ?`,
      [Number(limit), offset]
    )

    res.json({ blogs, total })
  } catch (error) {
    console.error('Latest blogs error:', error)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

router.get('/blogcardgroup', async (req, res) => {
  const { page = 1, limit = 6 } = req.query
  const offset = (page - 1) * limit

  try {
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM blogoverview WHERE blog_valid_value = 1'
    )

    const [blogs] = await db.query(
      `SELECT * FROM blogoverview 
       WHERE blog_valid_value = 1
       ORDER BY blog_created_date DESC 
       LIMIT ? OFFSET ?`,
      [Number(limit), offset]
    )

    res.json({ blogs, total })
  } catch (error) {
    console.error('Latest blogs error:', error)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

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

    // 獲取上傳的圖片路徑
    const blog_image = req.file ? `/blog-images/${req.file.originalname}` : null

    // 創建要插入的資料物件
    const blogData = {
      user_id,
      blog_type,
      blog_title,
      blog_content,
      blog_brand,
      blog_brand_model,
      blog_keyword,
      blog_valid_value,
      blog_created_date,
      blog_image,
    }

    // 執行插入操作
    const [result] = await db.query('INSERT INTO blogoverview SET ?', [
      blogData,
    ])

    res.json({
      success: true,
      message: '新增成功',
      blog_id: result.insertId, // 返回新插入的 ID
    })
  } catch (error) {
    console.error('資料庫錯誤:', error)
    res.status(500).json({
      success: false,
      message: '新增失敗，請稍後再試',
    })
  }
})

router.get('/blog-user-detail/:blog_id', async (req, res) => {
  try {
    const blogId = req.params.blog_id // 從 URL 參數中獲取 blog_id

    // 從 blogoverview 表中撈取符合條件的資料
    const [blogData] = await db.query(
      `
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
      WHERE blog_valid_value = 1 AND blog_id = ?
    `,
      [blogId]
    )

    // 檢查是否有撈到資料
    if (blogData.length === 0) {
      return res.json({ status: 'error', message: '查無相關部落格資料' })
    }

    // 回傳資料
    res.json({ status: 'success', data: blogData[0] })
  } catch (error) {
    console.error('Error fetching blog data:', error)
    res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

router.get('/blog-detail/:blog_id', async (req, res) => {
  try {
    const blogId = req.params.blog_id // 從 URL 參數中獲取 blog_id

    // 從 blogoverview 表中撈取符合條件的資料
    const [blogData] = await db.query(
      `
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
      WHERE blog_valid_value = 1 AND blog_id = ?
    `,
      [blogId]
    )

    // 檢查是否有撈到資料
    if (blogData.length === 0) {
      return res.json({ status: 'error', message: '查無相關部落格資料' })
    }

    // 回傳資料
    res.json({ status: 'success', data: blogData[0] })
  } catch (error) {
    console.error('Error fetching blog data:', error)
    res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

router.get('/bloguseroverview/:blog_id', async (req, res) => {
  try {
    const [blogData] = await db.query(
      `SELECT * FROM blogoverview WHERE blog_id = ? AND blog_valid_value = 1`,
      [req.params.blog_id]
    )

    if (blogData.length === 0) {
      return res.json({ status: 'error', message: '查無資料' })
    }

    res.json({ status: 'success', data: blogData[0] })
  } catch (error) {
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

router.get('/blog-edit/:blog_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM blogoverview WHERE blog_id = ?',
      [req.params.blog_id]
    )
    // console.log('後端返回的資料:', rows[0]) // 檢查資料
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ error: '獲取失敗' })
  }
})

router.put(
  '/blog-edit/:blog_id',
  upload.single('blog_image'),
  async (req, res) => {
    try {
      const {
        user_id,
        blog_type,
        blog_title,
        blog_content,
        blog_brand,
        blog_brand_model,
        blog_keyword,
        originalImage,
      } = req.body

      // 修改圖片處理邏輯
      let blog_image = null
      if (req.file) {
        // 有新上傳的圖片
        blog_image = `/blog-images/${req.file.originalname}`
      } else if (originalImage) {
        // 使用原始圖片
        blog_image = originalImage
      }

      const sql = `
      UPDATE blogoverview 
      SET user_id=?, blog_type=?, blog_title=?, blog_content=?, 
          blog_brand=?, blog_brand_model=?, blog_keyword=?, 
          blog_image=?
      WHERE blog_id=?
    `

      await db.query(sql, [
        user_id,
        blog_type,
        blog_title,
        blog_content,
        blog_brand,
        blog_brand_model,
        blog_keyword,
        blog_image,
        req.params.blog_id,
      ])

      res.json({
        success: true,
        blog_image: blog_image, // 返回最終使用的圖片路徑
      })
    } catch (error) {
      console.error('更新錯誤:', error)
      res.status(500).json({ error: '更新失敗' })
    }
  }
)

// 軟刪除部落格（把valid設為0）
router.put('/blog-delete/:blog_id', async (req, res) => {
  try {
    await db.query(
      'UPDATE blogoverview SET blog_valid_value = 0 WHERE blog_id = ?',
      [req.params.blog_id]
    )
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: '刪除失敗' })
  }
})

router.get('/blog_user_overview/:user_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, u.name as user_name 
       FROM blogoverview b
       JOIN users u ON b.user_id = u.user_id 
       WHERE b.user_id = ? AND b.blog_valid_value = 1 
       ORDER BY b.blog_created_date DESC`,
      [req.params.user_id]
    )

    // 檢查是否有資料
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: '找不到該文章' })
    }

    // 回傳整個陣列
    res.json(rows)
  } catch (error) {
    console.error('部落格查詢錯誤:', error)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// GET 評論路由
router.get('/blog-comment/:blog_id', async (req, res) => {
  try {
    const [blogComment] = await db.query(
      `SELECT 
        bc.*,
        users.name,
        users.image_path
      FROM blogcomment bc
      LEFT JOIN users ON bc.user_id = users.user_id
      WHERE bc.blog_id = ?
      ORDER BY bc.blog_created_date ASC`,
      [req.params.blog_id]
    )

    // 處理每條評論的圖片路徑
    const processedComments = blogComment.map((comment) => {
      if (!comment.image_path) {
        return comment
      }

      // 檢查是否已經是完整的 base64 或檔案路徑
      if (
        comment.image_path.startsWith('data:image') ||
        comment.image_path.startsWith('http') ||
        comment.image_path.startsWith('/')
      ) {
        return comment
      }

      // 檢查是否為純 base64 字串
      if (comment.image_path.startsWith('/9j/')) {
        // JPEG 圖片
        return {
          ...comment,
          image_path: `data:image/jpeg;base64,${comment.image_path}`,
        }
      } else if (comment.image_path.startsWith('iVBOR')) {
        // PNG 圖片
        return {
          ...comment,
          image_path: `data:image/png;base64,${comment.image_path}`,
        }
      }

      // 如果都不是，回傳原始資料
      return comment
    })

    // 記錄處理結果（開發時可用）
    console.log('處理第一筆資料的圖片：', {
      original: blogComment[0]?.image_path?.substring(0, 50),
      processed: processedComments[0]?.image_path?.substring(0, 50),
    })

    res.json(processedComments || [])
  } catch (error) {
    console.error('部落格查詢錯誤:', error)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

// POST 評論路由
router.post('/blog-comment/:blog_id', async (req, res) => {
  const { blog_id } = req.params
  const { user_id, blog_content, blog_created_date } = req.body

  try {
    // 1. 新增評論
    const [result] = await db.execute(
      `INSERT INTO blogcomment 
      (blog_id, user_id, blog_content, blog_created_date) 
      VALUES (?, ?, ?, ?)`,
      [blog_id, user_id, blog_content, blog_created_date]
    )

    // 2. 獲取剛新增的評論及用戶資料
    const [newComment] = await db.query(
      `SELECT 
        bc.*,
        users.name,
        users.image_path
      FROM blogcomment bc
      LEFT JOIN users ON bc.user_id = users.user_id
      WHERE bc.blog_comment_id = ?`,
      [result.insertId]
    )

    res.json(newComment[0])
  } catch (error) {
    console.error('新增評論錯誤:', error)
    res.status(500).json({ error: 'Error posting comment' })
  }
})

// 後端修改 - blog.js router
router.get('/search', async (req, res) => {
  const {
    page = 1,
    limit = 6,
    search = '',
    types = '',
    brands = '',
  } = req.query
  const offset = (page - 1) * limit

  try {
    let whereConditions = ['blog_valid_value = 1']
    let params = []

    if (search) {
      whereConditions.push('(blog_content LIKE ? OR blog_title LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }

    if (types) {
      const typeArray = types.split(',').filter(Boolean)
      if (typeArray.length) {
        whereConditions.push(
          `blog_type IN (${typeArray.map(() => '?').join(',')})`
        )
        params.push(...typeArray)
      }
    }

    if (brands) {
      const brandArray = brands.split(',').filter(Boolean)
      if (brandArray.length) {
        whereConditions.push(
          `blog_brand IN (${brandArray.map(() => '?').join(',')})`
        )
        params.push(...brandArray)
      }
    }

    const whereClause = whereConditions.length
      ? `WHERE ${whereConditions.join(' AND ')}`
      : ''

    const query = `
      SELECT * FROM blogoverview 
      ${whereClause}
      ORDER BY blog_created_date DESC
      LIMIT ? OFFSET ?
    `

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM blogoverview 
      ${whereClause}
    `

    const [countResult, blogsResult] = await Promise.all([
      db.query(countQuery, params),
      db.query(query, [...params, parseInt(limit), parseInt(offset)]),
    ])

    res.json({
      blogs: blogsResult[0],
      total: countResult[0][0].total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(countResult[0][0].total / parseInt(limit)),
    })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

export default router
