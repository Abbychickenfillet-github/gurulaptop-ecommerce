import express from 'express'
import { chatController } from '../controllers/chatController.js'
import { chatService } from '../services/chatService.js'
import { checkAuth } from './auth.js'
import db from '../configs/mysql.js'

const router = express.Router()

// 套用身份驗證中間件
router.use(checkAuth)

// === 聊天室成員管理 ===
router.post('/rooms/:roomId/leave', async (req, res) => {
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    const { roomId } = req.params
    const userId = req.user.user_id

    // 獲取群組資訊
    const [[groupInfo]] = await connection.execute(
      'SELECT group_id FROM `group` WHERE chat_room_id = ?',
      [roomId]
    )

    if (!groupInfo) {
      throw new Error('找不到該群組')
    }

    // 從聊天室成員中移除
    await connection.execute(
      'DELETE FROM chat_room_members WHERE room_id = ? AND user_id = ?',
      [roomId, userId]
    )

    // 從群組成員中移除
    await connection.execute(
      'DELETE FROM group_members WHERE group_id = ? AND member_id = ?',
      [groupInfo.group_id, userId]
    )

    // 新增系統消息記錄離開事件
    const [[userData]] = await connection.execute(
      'SELECT name FROM users WHERE user_id = ?',
      [userId]
    )

    const systemMessage = JSON.stringify({
      type: 'system',
      content: `使用者 ${userData.name || '未知用戶'} 已離開群組`,
    })

    await connection.execute(
      'INSERT INTO chat_messages (room_id, sender_id, message, is_system) VALUES (?, ?, ?, 1)',
      [roomId, 0, systemMessage]
    )

    await connection.commit()

    // 更新在線成員數量
    const [[memberCount]] = await connection.execute(
      'SELECT COUNT(*) as count FROM group_members WHERE group_id = ? AND status = "accepted"',
      [groupInfo.group_id]
    )

    // 廣播更新消息
    chatService.broadcastToRoom(roomId, {
      type: 'memberLeft',
      userId: userId,
      userName: userData.name || '未知用戶',
      groupId: groupInfo.group_id,
      memberCount: memberCount.count,
      timestamp: new Date().toISOString(),
    })

    res.json({
      status: 'success',
      message: '已成功離開聊天室',
      data: { memberCount: memberCount.count },
    })
  } catch (error) {
    await connection.rollback()
    console.error('離開聊天室失敗:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || '離開聊天室失敗',
    })
  } finally {
    connection.release()
  }
})

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

// === 申請相關路由 ===
router.get('/requests/pending', async (req, res) => {
  try {
    const userId = req.user.user_id
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

router.get('/requests/history', async (req, res) => {
  try {
    const userId = req.user.user_id
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

// === 使用者相關路由 ===
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

// === 群組相關路由 ===
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

// === 錯誤處理中間件 ===
router.use((error, req, res, next) => {
  console.error('Chat API Error:', error)
  res.status(500).json({
    status: 'error',
    message: error.message || '伺服器內部錯誤',
  })
})

export default router
