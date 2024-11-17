import express from 'express'
import { chatController } from '../controllers/chatController.js'
import { checkAuth } from './auth.js'
import db from '../configs/mysql.js'

const router = express.Router()

// 套用身份驗證中間件
router.use(checkAuth)

// === 訊息相關路由 ===
router.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params
    const userId = req.user.user_id

    const result = await chatController.getMessages(roomId, userId)
    res.json(result)
  } catch (error) {
    console.error('獲取聊天室訊息失敗:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || '獲取聊天室訊息失敗',
    })
  }
})

router.post('/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params
    const { message } = req.body
    const userId = req.user.user_id

    const result = await chatController.sendMessage(userId, roomId, message)
    res.json(result)
  } catch (error) {
    console.error('發送訊息失敗:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || '發送訊息失敗',
    })
  }
})

// 取得申請歷史記錄
router.get('/requests/history', async (req, res) => {
  try {
    const userId = req.user.user_id
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: '未授權的請求',
      })
    }

    const requests = await chatController.getRequestHistory(userId)
    res.json(requests)
  } catch (error) {
    console.error('獲取申請歷史失敗:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || '獲取申請歷史失敗',
    })
  }
})

// 取得使用者群組
router.get('/user/groups', async (req, res) => {
  try {
    const userId = req.user.user_id
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: '未授權的請求',
      })
    }

    const result = await chatController.getUserGroups(userId)
    res.json(result)
  } catch (error) {
    console.error('獲取使用者群組失敗:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || '獲取使用者群組失敗',
    })
  }
})

// 私人訊息
router.get('/messages/private', async (req, res) => {
  try {
    const userId = req.user.user_id
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: '未授權的請求',
      })
    }

    const withUserId = req.query.withUserId
    const result = await chatController.getPrivateMessages(userId, withUserId)
    res.json(result)
  } catch (error) {
    console.error('獲取私人訊息失敗:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || '獲取私人訊息失敗',
    })
  }
})

// 待處理申請
router.get('/requests/pending', async (req, res) => {
  try {
    const userId = req.user.user_id
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: '未授權的請求',
      })
    }

    const result = await chatController.getPendingRequests(userId)
    res.json(result)
  } catch (error) {
    console.error('獲取待處理申請失敗:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || '獲取待處理申請失敗',
    })
  }
})

// 處理群組申請
router.patch('/requests/:requestId', async (req, res) => {
  try {
    const userId = req.user.user_id
    const { requestId } = req.params
    const { status } = req.body

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: '未授權的請求',
      })
    }

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: '無效的狀態值',
      })
    }

    const result = await chatController.handleGroupRequest(userId, {
      requestId: parseInt(requestId),
      status,
    })

    res.json(result)
  } catch (error) {
    console.error('處理群組申請失敗:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || '處理群組申請失敗',
    })
  }
})
router.use((error, req, res, next) => {
  console.error('Chat API Error:', error)
  res.status(500).json({
    status: 'error',
    message: error.message || '伺服器內部錯誤',
  })
})

router.get('/users', async (req, res) => {
  let connection
  try {
    connection = await db.getConnection()
    const [users] = await connection.execute(
      `SELECT 
          user_id,
          name,
          email,
          image_path,
          created_at
        FROM users 
        WHERE valid = 1`
    )

    res.json({
      status: 'success',
      data: users.map((user) => ({
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        image: user.image_path,
        createdAt: user.created_at,
      })),
    })
  } catch (error) {
    console.error('獲取使用者列表錯誤:', error)
    res.status(500).json({
      status: 'error',
      message: '獲取使用者列表失敗',
    })
  } finally {
    if (connection) connection.release()
  }
})

export default router
