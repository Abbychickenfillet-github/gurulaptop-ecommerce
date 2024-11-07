import express from 'express'
import db from '##/configs/mysql.js'
import multer from 'multer'

const router = express.Router()
// 指定router變成變數，router是一個方法，處理路由

// 解析傳來的請求，目前我是用 fetch()

// 有撈到了啦 json http://localhost:3005/api/article/1
// 動態路由記得寫

const upload = multer({
  storage: multer.diskStorage({
    destination:
      'C:/Users/iii_student/Desktop/laptopGuru/backend/data/blog/blog-images', // 您的本機路徑
    filename: (req, file, cb) => {
      cb(null, file.originalname)
    },
  }),
})

// 查詢後得到的變數是 responseData
console.log('有進來 blog.js 而已，下一步路由沒有進去，檢查分個路由')

router.get('/blog-detail/:blog_id', async (req, res) => {
  try {
    const blogId = req.params.blog_id // 從 URL 參數中獲取 blog_id

    // 從 blogoverview 表中撈取符合條件的資料
    const [blogData] = await db.query(
      `
      SELECT 
        blog_user_id,
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

// 加入 upload.single('blog_image') 中間件
router.post('/blogcreated', upload.single('blog_image'), async (req, res) => {
  console.log(req.body.blog_valid_value)

  try {
    const {
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

    const sql = `
    INSERT INTO blogoverview 
    ( blog_type,
      blog_title,
      blog_content,
      blog_brand,
      blog_brand_model,
      blog_keyword,
      blog_valid_value,
      blog_created_date, blog_image) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const values = [
      blog_type,
      blog_title,
      blog_content,
      blog_brand,
      blog_brand_model,
      blog_keyword,
      blog_valid_value,
      blog_created_date,
      blog_image,
    ]

    const [result] = await db.query(sql, values)

    res.json({
      success: true,
      message: '新增成功',
      id: result.insertId,
    })
  } catch (error) {
    console.error('資料庫錯誤:', error)
    res.status(500).json({
      success: false,
      message: '新增失敗，請稍後再試',
    })
  }
})

router.get('/blog_detail/:blog_id', async (req, res) => {
  try {
    const [overview] = await db.query(
      'SELECT * FROM blogoverview WHERE blog_id = ?',
      [req.params.blog_id]
    )

    const [comments] = await db.query(
      'SELECT * FROM blogcomment WHERE blog_id = ?',
      [req.params.blog_id]
    )

    const [images] = await db.query(
      'SELECT blog_image FROM blogimage WHERE blog_id = ?',
      [req.params.blog_id]
    )

    const [keywords] = await db.query(
      'SELECT blog_keyword FROM blogkeyword WHERE blog_id = ?',
      [req.params.blog_id]
    )

    res.json({
      overview,
      comments,
      images,
      keywords,
    })
  } catch (error) {
    res.status(500).json({ message: '伺服器錯誤' })
  }
})

router.get('/blogcard', upload.none(), async (req, res, next) => {
  try {
    // 從 query 參數中接收 blog_id
    const blogId = req.query.blog_id

    // 從 blogoverview 表中撈取符合條件的資料，根據 blog_id
    const [blogData] = await db.query(
      `
      SELECT 
        blog_user_id,
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

    // 2. 根據 blog_id 從 blogimage 表中撈取對應的圖片
    const [imagesData] = await db.query(
      `
      SELECT blog_id, blog_image
      FROM blogimage
      WHERE blog_id = ?
      ORDER BY blog_id DESC
    `,
      [blogId]
    )

    // 把圖片資料加入每篇文章
    const blogWithImages = blogData.map((blog) => {
      const images = imagesData
        .filter((image) => image.blog_id === blog.blog_id)
        .map((image) => image.blog_image)
      return {
        ...blog,
        images: images,
      }
    })

    // 回傳資料
    res.json({ status: 'success', data: blogWithImages })
  } catch (error) {
    console.error('Error fetching blog data:', error)
    res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

router.post('/blog-created', upload.none(), async (req, res) => {
  const {
    blog_user_id,
    blog_title,
    blog_content,
    blog_created_date,
    blog_brand,
    blog_brand_model,
    blog_type,
    blog_images, // 假設圖片以陣列形式傳遞
  } = req.body // 從 req.body 獲取所有必填欄位

  // 檢查必要的欄位是否存在
  if (!blog_user_id || !blog_title || !blog_content) {
    return res.status(400).json({
      status: 'error',
      message: '必填欄位喔!',
    })
  }

  try {
    // 插入部落格文章的資料
    const [result] = await db.query(
      'INSERT INTO blogoverview (blog_user_id, blog_title, blog_content, blog_created_date, blog_brand, blog_brand_model, blog_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        blog_user_id,
        blog_title,
        blog_content,
        blog_created_date,
        blog_brand,
        blog_brand_model,
        blog_type,
      ]
    )
    // 得到新的 blog_id，創建後回傳的
    const blog_id = result.insertId

    if (blog_images && blog_images.length > 0) {
      const imageInsertPromises = blog_images.map((image) => {
        return db.query(
          'INSERT INTO blogimage (blog_id, blog_image) VALUES (?, ?)',
          [blog_id, image]
        )
      })

      // 等待所有的插入操作完成
      await Promise.all(imageInsertPromises)
    }

    res.status(201).json({
      status: 'success',
      message: '部落格文章已成功創建',
      blog_id: blog_id, // 回傳新創建的 blog_id
    })
  } catch (error) {
    console.error('Error creating blog:', error)
    res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

router.patch('/blog-delete/:blog_id', async (req, res) => {
  const { blog_id } = req.params

  if (!blog_id) {
    return res.status(400).json({ status: 'error', message: '缺少 blog_id' })
  }

  try {
    const [result] = await db.query(
      'UPDATE blogoverview SET blog_valid_value = 0 WHERE blog_id = ?',
      [blog_id]
    )

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: 'error', message: '查無此部落格文章，無法標記為刪除' })
    }

    res.status(200).json({
      status: 'success',
      message: '部落格文章已成功標記為刪除',
    })
  } catch (error) {
    console.error('Error marking blog as deleted:', error)

    res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

export default router
