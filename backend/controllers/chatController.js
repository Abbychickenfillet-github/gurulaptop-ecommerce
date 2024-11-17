import ChatRoom from '../models/ChatRoom.js'
import { chatService } from '../services/chatService.js'
import db from '../configs/mysql.js'

export const chatController = {
  // === 群組申請相關方法 ===
  getPendingRequests: async (userId) => {
    try {
      const requests = await ChatRoom.getPendingRequests(userId)
      return {
        status: 'success',
        data: requests,
      }
    } catch (error) {
      console.error('獲取待處理申請錯誤:', error)
      throw new Error('獲取待處理申請失敗')
    }
  },

  getRequestHistory: async (userId) => {
    try {
      const requests = await ChatRoom.getGroupRequestHistory(userId)
      return {
        status: 'success',
        data: requests,
      }
    } catch (error) {
      console.error('獲取申請歷史錯誤:', error)
      throw error
    }
  },

  handleGroupRequest: async (userId, requestData) => {
    const connection = await db.getConnection()
    try {
      await connection.beginTransaction()

      const { requestId, status } = requestData
      const request = await ChatRoom.getGroupRequestById(requestId)

      if (!request) {
        throw new Error('找不到該申請')
      }

      if (request.creator_id !== userId) {
        throw new Error('沒有權限處理此申請')
      }

      await ChatRoom.updateGroupRequest(requestId, { status })

      if (status === 'accepted') {
        await ChatRoom.addGroupMember(request.group_id, request.sender_id)

        if (request.chat_room_id) {
          await ChatRoom.saveMessage({
            roomId: request.chat_room_id,
            senderId: userId,
            message: JSON.stringify({
              type: 'system',
              content: `使用者 ${request.sender_name} 已加入群組`,
            }),
            isSystem: true,
          })

          // 更新成員數量
          const [[memberCount]] = await connection.execute(
            'SELECT COUNT(*) as count FROM group_members WHERE group_id = ? AND status = "accepted"',
            [request.group_id]
          )

          chatService.broadcastToRoom(request.chat_room_id, {
            type: 'groupUpdate',
            groupId: request.group_id,
            memberCount: memberCount.count,
          })
        }
      }

      await connection.commit()
      return {
        status: 'success',
        message: `申請已${status === 'accepted' ? '接受' : '拒絕'}`,
      }
    } catch (error) {
      await connection.rollback()
      console.error('處理群組申請錯誤:', error)
      throw error
    } finally {
      connection.release()
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

  // === 訊息相關方法 ===
  getMessages: async (roomId, userId) => {
    try {
      if (!roomId || !userId) {
        return {
          status: 'success',
          data: [],
        }
      }

      const isMember = await ChatRoom.isMember(roomId, userId)
      if (!isMember) {
        throw new Error('您不是該聊天室的成員')
      }

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
    const connection = await db.getConnection()
    try {
      await connection.beginTransaction()

      const isMember = await ChatRoom.isMember(roomId, senderId)
      if (!isMember) {
        throw new Error('您不是該聊天室的成員')
      }

      const messageId = await ChatRoom.saveMessage({
        roomId,
        senderId,
        message,
      })

      const [[messageData]] = await connection.execute(
        `
        SELECT 
          cm.*,
          u.name as sender_name,
          u.image_path as sender_image
        FROM chat_messages cm
        JOIN users u ON cm.sender_id = u.user_id
        WHERE cm.id = ?
      `,
        [messageId]
      )

      await connection.commit()

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
      await connection.rollback()
      console.error('發送訊息錯誤:', error)
      throw error
    } finally {
      connection.release()
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
