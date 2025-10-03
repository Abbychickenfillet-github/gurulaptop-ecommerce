import ChatRoom from '../models/ChatRoom.js'
import { chatService } from '../services/chatService.js'
// import db from '../configs/mysql.js'
import pool from '##/configs/pgClient.js'
// backend/routes/chat.js 導入並使用了 chatController
export const chatController = {
  // 群組申請相關方法
  getPendingRequests: async (userId) => {
    try {
      const { rows: requests } = await pool.query(
        `SELECT
          gr.*,
          u.name as sender_name,
          u.image_path as sender_image,
          g.group_name,
          g.creator_id,
          g.chat_room_id
        FROM group_requests gr
        JOIN users u ON gr.sender_id = u.user_id
        JOIN \`group\` g ON gr.group_id = g.group_id
        WHERE g.creator_id = ? AND gr.status = 'pending'
        ORDER BY gr.created_at DESC`,
        [userId]
      )

      return {
        status: 'success',
        data: requests,
      }
    } catch (error) {
      console.error('獲取待處理申請錯誤:', error)
      throw error
    }
  },

  handleGroupRequest: async (userId, requestData) => {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const { requestId, status } = requestData

      // 獲取申請詳情與申請者資訊
      const { rows: [request] } = await client.query(
        `SELECT gr.*, g.chat_room_id, g.group_name,
                u.name as sender_name, u.image_path as sender_image, g.creator_id
         FROM group_requests gr
         JOIN "group" g ON gr.group_id = g.group_id
         JOIN users u ON gr.sender_id = u.user_id
         WHERE gr.id = $1`,
        [requestId]
      )

      if (!request) {
        throw new Error('找不到該申請')
      }

      if (request.creator_id !== userId) {
        throw new Error('沒有權限處理此申請')
      }

      await client.query(
        'UPDATE group_requests SET status = $1, updated_at = NOW() WHERE id = $2',
        [status, requestId]
      )

      if (status === 'accepted') {
        await client.query(
          'INSERT INTO group_members (group_id, member_id, status) VALUES ($1, $2, $3)',
          [request.group_id, request.sender_id, 'accepted']
        )

        if (request.chat_room_id) {
          await client.query(
            'INSERT INTO chat_room_members (room_id, user_id) VALUES ($1, $2)',
            [request.chat_room_id, request.sender_id]
          )

          // 發送系統消息
          const systemMessage = JSON.stringify({
            type: 'system',
            content: `使用者 ${request.sender_name} 已加入群組`,
          })

          await client.query(
            'INSERT INTO chat_messages (room_id, sender_id, message, is_system) VALUES ($1, $2, $3, TRUE)',
            [request.chat_room_id, userId, systemMessage]
          )

          // 更新成員數量
          const { rows: [memberCount] } = await client.query(
            'SELECT COUNT(*) as count FROM group_members WHERE group_id = $1 AND status = $2',
            [request.group_id, 'accepted']
          )

          // 廣播群組更新
          chatService.broadcastToRoom(request.chat_room_id, {
            type: 'groupUpdate',
            groupId: request.group_id,
            memberCount: memberCount.count,
            senderName: request.sender_name,
            senderImage: request.sender_image,
            status: status,
            timestamp: new Date().toISOString(),
          })
        }
      }

      await client.query('COMMIT')
      return {
        status: 'success',
        message: `申請已${status === 'accepted' ? '接受' : '拒絕'}`,
        data: {
          sender_name: request.sender_name,
          sender_image: request.sender_image,
        },
      }
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('處理群組申請錯誤:', error)
      throw error
    } finally {
      client.release()
    }
  },

  // === 聊天室相關方法 ===
  getRooms: async () => {
    try {
      const rooms = await ChatRoom.getAll()
      return {
        status: 'success',
        data: rooms,
      }
    } catch (error) {
      console.error('獲取聊天室列表錯誤:', error)
      throw new Error('獲取聊天室列表失敗')
    }
  },

  getUserGroups: async (userId) => {
    try {
      if (!userId) {
        throw new Error('使用者ID必須提供')
      }

      const groups = await ChatRoom.getUserGroups(userId)
      return {
        status: 'success',
        data: groups.map((group) => ({
          id: group.group_id,
          name: group.group_name,
          description: group.description,
          maxMembers: group.max_members,
          memberCount: group.member_count || 0,
          createdAt: group.creat_time,
          groupTime: group.group_time,
          chatRoomId: group.chatRoomId,
          group_img: group.group_img,
          creatorId: group.creator_id,
          creatorName: group.creator_name,
        })),
      }
    } catch (error) {
      console.error('獲取使用者群組錯誤:', error)
      throw error
    }
  },

  // 獲取申請歷史記錄
  getRequestHistory: async (userId) => {
    try {
      // 使用 ChatRoom Model 來獲取申請歷史
      const history = await ChatRoom.getGroupRequestHistory(userId)
      return {
        status: 'success',
        data: history,
      }
    } catch (error) {
      console.error('獲取申請歷史錯誤:', error)
      throw error
    }
  },

  // === 訊息相關方法 ===
  //  - 獲取聊天室訊息
  getMessages: async (roomId, userId) => {
    try {
      if (!roomId || !userId) {
        return {
          status: 'success',
          data: [],
        }
      }
      // ChatRoom.isMember() 是一種模型層的方法調用
      // ChatRoom.js 是 Model 層檔案，負責與資料庫互動
      // isMember() 方法會查詢 chat_room_members 資料表，檢查指定用戶是否為該聊天室成員
      // 這不是讀取 API，而是直接查詢 PostgreSQL 資料庫
      // 語法：await model.method(param1, param2) 代表非同步等待資料庫查詢結果
      const isMember = await ChatRoom.isMember(roomId, userId)
      if (!isMember) {
        throw new Error('您不是該聊天室的成員')
      }

      // 去await Model檔案(ChatRoom.js)，取得getMessages資料
      const messages = await ChatRoom.getMessages(roomId)
      return {
        status: 'success',
        data: messages,
      }
    } catch (error) {
      console.error('獲取聊天室訊息失敗:', error)
      throw error
    }
  },

  sendMessage: async (senderId, roomId, message) => {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const isMember = await ChatRoom.isMember(roomId, senderId)
      if (!isMember) {
        throw new Error('您不是該聊天室的成員')
      }

      const messageId = await ChatRoom.saveMessage({
        roomId,
        senderId,
        message,
      })
      // 後端去資料表取得訊息資料
      const { rows: [messageData] } = await client.query(
        `
        SELECT
          cm.*,
          u.name as sender_name,
          u.image_path as sender_image
        FROM chat_messages cm
        JOIN users u ON cm.sender_id = u.user_id
          WHERE cm.id = $1
      `,
        [messageId]
      )

      await client.query('COMMIT')

      await chatService.broadcastToRoom(roomId, {
        type: 'message',
        id: messageId,
        room_id: roomId,
        sender_id: senderId,
        sender_name: messageData.sender_name,
        sender_image: messageData.sender_image,
        message: message,
        created_at: messageData.created_at,
        is_system: false,
      })

      return {
        status: 'success',
        data: { messageId },
      }
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('發送訊息錯誤:', error)
      throw error
    } finally {
      client.release()
    }
  },

  getPrivateMessages: async (userId) => {
    try {
      const data = []
      return {
        status: 'success',
        data,
      }
    } catch (error) {
      console.error('獲取私人訊息錯誤:', error)
      throw error
    }
  },

  // 加入聊天室
  joinRoom: async (roomId, userId) => {
    try {
      // 檢查用戶是否已經在聊天室中
      const isMember = await ChatRoom.isMember(roomId, userId)
      if (isMember) {
        return { status: 'success', message: '用戶已經在聊天室中' }
      }

      // 將用戶添加到聊天室
      await ChatRoom.addMember(roomId, userId)

      return {
        status: 'success',
        message: '成功加入聊天室',
        data: { roomId, userId }
      }
    } catch (error) {
      console.error('加入聊天室錯誤:', error)
      throw error
    }
  },

  // 離開聊天室
  leaveRoom: async (roomId, userId) => {
    try {
      // 將用戶從聊天室移除
      const removed = await ChatRoom.removeMember(roomId, userId)

      if (!removed) {
        return { status: 'warning', message: '用戶不在該聊天室中' }
      }

      return {
        status: 'success',
        message: '成功離開聊天室',
        data: { roomId, userId }
      }
    } catch (error) {
      console.error('離開聊天室錯誤:', error)
      throw error
    }
  },

  // === WebSocket 相關方法 ===
  registerWebSocket: async (ws, userId) => {
    try {
      chatService.addConnection(userId, ws)
      return {
        type: 'registered',
        success: true,
      }
    } catch (error) {
      console.error('WebSocket 註冊錯誤:', error)
      throw error
    }
  },

  handleWebSocketMessage: async (ws, data) => {
    try {
      const { type, ...messageData } = data

      switch (type) {
        case 'message':
          await chatController.sendMessage(
            messageData.fromID,
            messageData.roomID,
            messageData.message
          )
          break

        case 'joinRoom':
          await chatController.joinRoom(messageData.roomID, messageData.fromID)
          break

        case 'leaveRoom':
          await chatController.leaveRoom(messageData.roomID, messageData.fromID)
          break

        case 'groupRequest':
          await chatController.handleGroupRequest(
            messageData.fromID,
            messageData
          )
          break

        default:
          console.warn('未知的 WebSocket 訊息類型:', type)
      }
    } catch (error) {
      console.error('處理 WebSocket 訊息錯誤:', error)
      ws.send(
        JSON.stringify({
          type: 'error',
          message: error.message,
        })
      )
    }
  },
}

export default chatController
