import express from 'express'
import { checkAuth } from '../routes/auth.js'
import db from '../configs/db.js'
const router = express.Router()

// 創建群組申請
router.post('/group-requests', checkAuth, async (req, res) => {
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

    // 檢查是否已有待處理申請
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

    // 將申請通知儲存為私人訊息
    await connection.query(
      `INSERT INTO messages 
       (sender_id, receiver_id, type, content, metadata) 
       VALUES (?, ?, 'group_request', ?, ?)`,
      [
        senderId,
        group[0].creator_id,
        '申請加入群組',
        JSON.stringify({
          requestId: requestResult.insertId,
          groupId,
          gameId,
          description,
        }),
      ]
    )

    await connection.commit()

    res.json({
      status: 'success',
      data: { requestId: requestResult.insertId },
    })
  } catch (error) {
    if (connection) await connection.rollback()
    res.status(400).json({
      status: 'error',
      message: error.message,
    })
  } finally {
    if (connection) connection.release()
  }
})

// 獲取群組的申請列表
router.get('/group-requests/:groupId', checkAuth, async (req, res) => {
  try {
    const { groupId } = req.params
    const userId = req.user.user_id

    const [requests] = await db.query(
      `SELECT gr.*, u.name as sender_name 
       FROM group_requests gr
       JOIN users u ON gr.sender_id = u.user_id
       WHERE gr.group_id = ? AND gr.status = 'pending'
       ORDER BY gr.created_at DESC`,
      [groupId]
    )

    res.json({
      status: 'success',
      data: requests,
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '獲取申請列表失敗',
    })
  }
})

// 處理申請
router.patch('/group-requests/:requestId', checkAuth, async (req, res) => {
  let connection
  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const { requestId } = req.params
    const { status } = req.body
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

      // 加入聊天室成員
      if (request[0].chat_room_id) {
        await connection.query(
          'INSERT INTO chat_room_members (room_id, user_id) VALUES (?, ?)',
          [request[0].chat_room_id, request[0].sender_id]
        )
      }
    }

    // 儲存申請結果訊息
    await connection.query(
      `INSERT INTO messages 
       (sender_id, receiver_id, type, content, metadata) 
       VALUES (?, ?, 'group_request_response', ?, ?)`,
      [
        userId,
        request[0].sender_id,
        status === 'accepted' ? '您的入團申請已被接受' : '您的入團申請已被拒絕',
        JSON.stringify({
          requestId,
          groupId: request[0].group_id,
          status,
        }),
      ]
    )

    await connection.commit()

    res.json({
      status: 'success',
      message: status === 'accepted' ? '已接受申請' : '已拒絕申請',
    })
  } catch (error) {
    if (connection) await connection.rollback()
    res.status(400).json({
      status: 'error',
      message: error.message,
    })
  } finally {
    if (connection) connection.release()
  }
})

export default router
