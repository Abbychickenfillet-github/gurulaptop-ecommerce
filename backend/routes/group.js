import express from 'express'
const router = express.Router()
import multer from 'multer'
import path from 'path'
import db from '../configs/mysql.js'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cors from 'cors'
import { checkAuth } from './auth.js'
import 'dotenv/config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 設定上傳目錄
const uploadDir = path.join(__dirname, '../public/uploads/groups')
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
} catch (error) {
  console.error('建立上傳目錄失敗:', error)
}

// 設定 CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}
router.use(cors(corsOptions))

// 設定 multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, 'group-' + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/
    const mimetype = allowedTypes.test(file.mimetype)
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    )

    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error('只允許上傳 .jpg, .jpeg, .png, .gif 格式的圖片'))
  },
})

// GET - 取得所有群組
router.get('/all', async function (req, res) {
  let connection
  try {
    connection = await db.getConnection()
    const [groups] = await connection.query(`
      SELECT g.*, u.name as creator_name, 
             COUNT(DISTINCT gm.member_id) as member_count,
             e.event_name 
      FROM \`group\` g
      LEFT JOIN users u ON g.creator_id = u.user_id
      LEFT JOIN group_members gm ON g.group_id = gm.group_id
      LEFT JOIN event_type e ON g.event_id = e.event_id
      GROUP BY g.group_id
      ORDER BY g.creat_time DESC
    `)

    return res.json({
      status: 'success',
      data: { groups },
    })
  } catch (error) {
    console.error('獲取群組失敗:', error)
    return res.json({
      status: 'error',
      message: '獲取群組失敗',
    })
  } finally {
    if (connection) connection.release()
  }
})

// GET - 獲取所有活動的揪團
router.get('/events', async function (req, res) {
  let connection
  try {
    connection = await db.getConnection()
    const [events] = await connection.query(`
      SELECT DISTINCT e.event_id, e.event_name 
      FROM \`group\` g 
      JOIN event_type e ON g.event_id = e.event_id
      WHERE g.event_id IS NOT NULL
      GROUP BY e.event_id
      HAVING COUNT(g.group_id) > 0
      ORDER BY e.event_start_time DESC
    `)

    return res.json({
      status: 'success',
      data: { events },
    })
  } catch (error) {
    console.error('獲取活動揪團失敗:', error)
    return res.status(500).json({
      status: 'error',
      message: '獲取活動揪團失敗',
    })
  } finally {
    if (connection) connection.release()
  }
})

// GET - 獲取使用者參與的群組
router.get('/user', checkAuth, async function (req, res) {
  let connection
  try {
    connection = await db.getConnection()
    const [groups] = await connection.query(
      `
      SELECT g.*, 
             u.name as creator_name, 
             (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id AND status = 'accepted') as member_count
      FROM group_members gm
      JOIN \`group\` g ON gm.group_id = g.group_id
      JOIN users u ON g.creator_id = u.user_id
      WHERE gm.member_id = ? AND gm.status = 'accepted'
      GROUP BY g.group_id
      ORDER BY g.creat_time DESC
    `,
      [req.user.user_id]
    )

    return res.json({
      status: 'success',
      data: { groups },
    })
  } catch (error) {
    console.error('獲取使用者群組失敗:', error)
    return res.status(500).json({
      status: 'error',
      message: '獲取使用者群組失敗',
    })
  } finally {
    if (connection) connection.release()
  }
})

// GET - 獲取使用者創建的群組
router.get('/creator', checkAuth, async function (req, res) {
  let connection
  try {
    connection = await db.getConnection()
    const [groups] = await connection.query(
      `
      SELECT g.*, 
             u.name as creator_name, 
             (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id AND status = 'accepted') as member_count
      FROM \`group\` g
      LEFT JOIN users u ON g.creator_id = u.user_id
      WHERE g.creator_id = ?
      GROUP BY g.group_id
      ORDER BY g.creat_time DESC
    `,
      [req.user.user_id]
    )

    return res.json({
      status: 'success',
      data: { groups },
    })
  } catch (error) {
    console.error('獲取創建群組失敗:', error)
    return res.status(500).json({
      status: 'error',
      message: '獲取創建群組失敗',
    })
  } finally {
    if (connection) connection.release()
  }
})

// GET - 取得單一群組
router.get('/:id', async function (req, res) {
  let connection
  try {
    connection = await db.getConnection()
    const [groups] = await connection.query(
      `SELECT g.*, 
             (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id AND status = 'accepted') as member_count,
             u.name as creator_name
      FROM \`group\` g
      LEFT JOIN users u ON g.creator_id = u.user_id
      WHERE g.group_id = ?`,
      [req.params.id]
    )

    if (groups.length === 0) {
      return res.json({
        status: 'error',
        message: '找不到群組',
      })
    }

    // 獲取群組成員及其申請資訊
    const [members] = await connection.query(
      `SELECT u.user_id, u.name, u.image_path, gm.status, gm.join_time,
              gr.game_id, gr.description
       FROM group_members gm
       JOIN users u ON gm.member_id = u.user_id
       LEFT JOIN (
         SELECT * FROM group_requests 
         WHERE status = 'accepted'
       ) gr ON gr.group_id = gm.group_id AND gr.sender_id = gm.member_id
       WHERE gm.group_id = ? AND gm.status = 'accepted'`,
      [req.params.id]
    )

    const group = groups[0]
    group.members = members

    return res.json({
      status: 'success',
      data: { group },
    })
  } catch (error) {
    console.error('獲取群組失敗:', error)
    return res.json({
      status: 'error',
      message: '獲取群組失敗',
    })
  } finally {
    if (connection) connection.release()
  }
})
// POST - 建立新群組
router.post('/', checkAuth, upload.single('group_img'), async (req, res) => {
  let connection
  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    // 從 token 中獲取用戶 ID
    const creator_id = req.user.user_id
    const { group_name, description, max_members, group_time, event_id } =
      req.body
    const group_img = req.file ? `/uploads/groups/${req.file.filename}` : ''

    // 驗證必要欄位
    if (!group_name?.trim()) {
      throw new Error('群組名稱為必填欄位')
    }
    if (!description?.trim()) {
      throw new Error('群組描述為必填欄位')
    }
    if (!max_members) {
      throw new Error('人數上限為必填欄位')
    }
    if (!group_time) {
      throw new Error('活動時間為必填欄位')
    }

    // 驗證活動時間不能早於現在
    const selectedTime = new Date(group_time)
    const now = new Date()
    if (selectedTime < now) {
      throw new Error('活動時間不能早於現在')
    }

    const maxMembersNum = parseInt(max_members, 10)
    if (isNaN(maxMembersNum) || maxMembersNum < 2) {
      throw new Error('人數上限必須大於等於 2')
    }

    // 驗證長度
    if (group_name.trim().length > 20) {
      throw new Error('群組名稱不能超過20字')
    }
    if (description.trim().length > 500) {
      throw new Error('群組描述不能超過500字')
    }

    // 建立聊天室
    const [chatRoomResult] = await connection.query(
      'INSERT INTO chat_rooms (name, creator_id) VALUES (?, ?)',
      [group_name.trim(), creator_id]
    )

    // 新增群組
    const [groupResult] = await connection.query(
      'INSERT INTO `group` (group_name, description, creator_id, max_members, group_img, chat_room_id, creat_time, group_time, event_id) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)',
      [
        group_name.trim(),
        description.trim(),
        creator_id,
        maxMembersNum,
        group_img,
        chatRoomResult.insertId,
        group_time,
        event_id || null,
      ]
    )

    if (!groupResult.insertId) {
      throw new Error('群組建立失敗')
    }

    // 加入創建者為成員
    await connection.query(
      'INSERT INTO group_members (group_id, member_id, join_time, status) VALUES (?, ?, NOW(), ?)',
      [groupResult.insertId, creator_id, 'accepted']
    )

    // 將創建者加入聊天室
    await connection.query(
      'INSERT INTO chat_room_members (room_id, user_id) VALUES (?, ?)',
      [chatRoomResult.insertId, creator_id]
    )

    // 在 group 表中記錄關聯的聊天室 ID（需要先在 group 表添加 chat_room_id 欄位）
    await connection.query(
      'UPDATE `group` SET chat_room_id = ? WHERE group_id = ?',
      [chatRoomResult.insertId, groupResult.insertId]
    )

    await connection.commit()

    res.json({
      status: 'success',
      message: '群組建立成功',
      data: {
        group_id: groupResult.insertId,
        chat_room_id: chatRoomResult.insertId,
        group_name: group_name.trim(),
        description: description.trim(),
        creator_id,
        max_members: maxMembersNum,
        group_img: group_img || null,
        group_time,
      },
    })
  } catch (error) {
    console.error('Error in group creation:', error)

    if (connection) {
      await connection.rollback()
    }

    if (req.file) {
      try {
        fs.unlinkSync(path.join(uploadDir, req.file.filename))
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError)
      }
    }

    res.status(400).json({
      status: 'error',
      message: error.message || '建立群組失敗',
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

// PUT - 更新群組
router.put('/:id', checkAuth, upload.single('group_img'), async (req, res) => {
  let connection
  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const groupId = req.params.id

    // 檢查群組是否存在及使用者權限
    const [groups] = await connection.query(
      'SELECT * FROM `group` WHERE group_id = ?',
      [groupId]
    )

    if (groups.length === 0) {
      throw new Error('找不到群組')
    }

    if (groups[0].creator_id !== req.user.user_id) {
      throw new Error('只有群組創建者可以修改群組資料')
    }

    const { group_name, description, max_members } = req.body
    const updateData = []
    const updateFields = []

    if (group_name) {
      updateFields.push('group_name = ?')
      updateData.push(group_name.trim())
    }
    if (description) {
      updateFields.push('description = ?')
      updateData.push(description.trim())
    }
    if (max_members) {
      updateFields.push('max_members = ?')
      updateData.push(parseInt(max_members))
    }
    if (req.file) {
      updateFields.push('group_img = ?')
      updateData.push(`/uploads/groups/${req.file.filename}`)

      // 刪除舊圖片
      if (groups[0].group_img) {
        const oldImagePath = path.join(
          __dirname,
          '../public',
          groups[0].group_img
        )
        fs.promises.unlink(oldImagePath).catch((err) => {
          console.error('Error deleting old image:', err)
        })
      }
    }

    if (updateFields.length > 0) {
      updateData.push(groupId)
      await connection.query(
        `UPDATE \`group\` SET ${updateFields.join(', ')} WHERE group_id = ?`,
        updateData
      )
    }

    await connection.commit()

    const [updatedGroup] = await connection.query(
      'SELECT * FROM `group` WHERE group_id = ?',
      [groupId]
    )

    return res.json({
      status: 'success',
      data: { group: updatedGroup[0] },
    })
  } catch (error) {
    if (connection) await connection.rollback()

    if (req.file) {
      try {
        fs.unlinkSync(path.join(uploadDir, req.file.filename))
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError)
      }
    }

    return res.status(400).json({
      status: 'error',
      message: error.message || '更新群組失敗',
    })
  } finally {
    if (connection) connection.release()
  }
})

// DELETE - 刪除群組
router.delete('/:id', checkAuth, async (req, res) => {
  let connection
  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [group] = await connection.query(
      'SELECT * FROM `group` WHERE group_id = ?',
      [req.params.id]
    )

    if (group.length === 0) {
      throw new Error('找不到群組')
    }

    if (group[0].creator_id !== req.user.user_id) {
      throw new Error('只有群組創建者可以刪除群組')
    }

    // 刪除群組圖片
    if (group[0].group_img) {
      const imagePath = path.join(__dirname, '../public', group[0].group_img)
      try {
        await fs.promises.unlink(imagePath)
      } catch (err) {
        console.error('Error deleting group image:', err)
      }
    }

    // 刪除群組成員記錄
    await connection.query('DELETE FROM group_members WHERE group_id = ?', [
      req.params.id,
    ])

    // 刪除群組
    await connection.query('DELETE FROM `group` WHERE group_id = ?', [
      req.params.id,
    ])

    await connection.commit()

    return res.json({
      status: 'success',
      message: '群組已刪除',
    })
  } catch (error) {
    if (connection) await connection.rollback()

    return res.status(400).json({
      status: 'error',
      message: error.message || '刪除群組失敗',
    })
  } finally {
    if (connection) connection.release()
  }
})

// 添加錯誤處理中間件
router.use((err, req, res, next) => {
  console.error('群組路由錯誤:', err)

  // 處理檔案上傳相關錯誤
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: '檔案大小不能超過 5MB',
      })
    }
    return res.status(400).json({
      status: 'error',
      message: '檔案上傳失敗',
    })
  }

  // 處理檔案不存在錯誤
  if (err.code === 'ENOENT') {
    return res.status(404).json({
      status: 'error',
      message: '找不到檔案',
    })
  }

  // 一般錯誤處理
  res.status(500).json({
    status: 'error',
    message: err.message || '伺服器錯誤',
  })
})

// 發送群組申請
router.post('/requests', checkAuth, async (req, res) => {
  let connection
  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const { groupId, gameId, description } = req.body
    const senderId = req.user.user_id

    // 檢查群組是否存在
    const [group] = await connection.query(
      'SELECT creator_id, group_name FROM `group` WHERE group_id = ?',
      [groupId]
    )

    if (!group.length) {
      throw new Error('找不到該群組')
    }

    // 檢查是否已經是成員
    const [existingMember] = await connection.query(
      'SELECT 1 FROM group_members WHERE group_id = ? AND member_id = ?',
      [groupId, senderId]
    )

    if (existingMember.length) {
      throw new Error('您已經是群組成員')
    }

    // 檢查是否已有待處理的申請
    const [existingRequest] = await connection.query(
      'SELECT 1 FROM group_requests WHERE group_id = ? AND sender_id = ? AND status = "pending"',
      [groupId, senderId]
    )

    if (existingRequest.length) {
      throw new Error('您已有待處理的申請')
    }

    // 新增申請記錄
    const [requestResult] = await connection.query(
      `INSERT INTO group_requests 
       (group_id, sender_id, creator_id, game_id, description) 
       VALUES (?, ?, ?, ?, ?)`,
      [groupId, senderId, group[0].creator_id, gameId, description]
    )

    await connection.commit()

    res.json({
      status: 'success',
      message: '申請已送出',
      data: { requestId: requestResult.insertId },
    })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('發送群組申請錯誤:', error)
    res.status(400).json({
      status: 'error',
      message: error.message || '發送申請失敗',
    })
  } finally {
    if (connection) connection.release()
  }
})

// 處理群組申請
router.patch('/requests/:requestId', checkAuth, async (req, res) => {
  let connection
  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const { requestId } = req.params
    const { status } = req.body // 'accepted' or 'rejected'
    const userId = req.user.user_id

    // 獲取申請詳情
    const [request] = await connection.query(
      `SELECT gr.*, g.chat_room_id
       FROM group_requests gr
       JOIN \`group\` g ON gr.group_id = g.group_id
       WHERE gr.id = ? AND gr.status = 'pending'`,
      [requestId]
    )

    if (!request.length) {
      throw new Error('找不到該申請或已處理')
    }

    if (request[0].creator_id !== userId) {
      throw new Error('只有群組創建者可以處理申請')
    }

    // 更新申請狀態
    await connection.query(
      'UPDATE group_requests SET status = ? WHERE id = ?',
      [status, requestId]
    )

    if (status === 'accepted') {
      // 加入群組成員
      await connection.query(
        'INSERT INTO group_members (group_id, member_id, status) VALUES (?, ?, "accepted")',
        [request[0].group_id, request[0].sender_id]
      )

      // 如果有聊天室，也加入聊天室成員
      if (request[0].chat_room_id) {
        await connection.query(
          'INSERT INTO chat_room_members (room_id, user_id) VALUES (?, ?)',
          [request[0].chat_room_id, request[0].sender_id]
        )
      }
    }

    await connection.commit()

    res.json({
      status: 'success',
      message: status === 'accepted' ? '已接受申請' : '已拒絕申請',
      data: { status },
    })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('處理群組申請錯誤:', error)
    res.status(400).json({
      status: 'error',
      message: error.message || '處理申請失敗',
    })
  } finally {
    if (connection) connection.release()
  }
})

// 獲取群組申請列表
router.get('/requests/:groupId', checkAuth, async (req, res) => {
  try {
    const { groupId } = req.params
    const userId = req.user.user_id

    // 驗證訪問權限
    const [group] = await db.query(
      'SELECT 1 FROM `group` WHERE group_id = ? AND creator_id = ?',
      [groupId, userId]
    )

    if (!group.length) {
      return res.status(403).json({
        status: 'error',
        message: '無權訪問該群組的申請列表',
      })
    }

    // 獲取申請列表
    const [requests] = await db.query(
      `SELECT gr.*, u.name as sender_name, u.image_path as sender_image
       FROM group_requests gr
       JOIN users u ON gr.sender_id = u.user_id
       WHERE gr.group_id = ?
       ORDER BY gr.created_at DESC`,
      [groupId]
    )

    res.json({
      status: 'success',
      data: requests,
    })
  } catch (error) {
    console.error('獲取群組申請列表錯誤:', error)
    res.status(500).json({
      status: 'error',
      message: '獲取申請列表失敗',
    })
  }
})

export default router
