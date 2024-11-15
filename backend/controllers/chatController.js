import ChatRoom from '../models/ChatRoom.js'
import { chatService } from '../services/chatService.js'

export const chatController = {
  // === 一般聊天室相關方法 ===

  // 取得所有聊天室
  getRooms: async (req, res) => {
    try {
      const rooms = await ChatRoom.getAll()
      res.json({ status: 'success', data: rooms })
    } catch (error) {
      console.error('取得聊天室列表錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '取得聊天室列表失敗',
      })
    }
  },

  // 取得單一聊天室詳情
  getRoomDetail: async (req, res) => {
    try {
      const { roomId } = req.params
      const room = await ChatRoom.getById(roomId)
      if (!room) {
        return res.status(404).json({
          status: 'error',
          message: '找不到該聊天室',
        })
      }
      res.json({ status: 'success', data: room })
    } catch (error) {
      console.error('取得聊天室詳情錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '取得聊天室詳情失敗',
      })
    }
  },

  // 建立一般聊天室
  createRoom: async (req, res) => {
    try {
      const { roomName } = req.body
      const creatorId = req.user.user_id

      const roomId = await ChatRoom.create({ roomName, creatorId })
      res.json({
        status: 'success',
        data: { roomId },
        message: '聊天室建立成功',
      })
    } catch (error) {
      console.error('建立聊天室錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '建立聊天室失敗',
      })
    }
  },

  // 更新聊天室
  updateRoom: async (req, res) => {
    try {
      const { roomId } = req.params
      const { name } = req.body
      const userId = req.user.user_id

      // 檢查權限
      const room = await ChatRoom.getById(roomId)
      if (!room) {
        return res.status(404).json({
          status: 'error',
          message: '找不到該聊天室',
        })
      }

      if (room.creator_id !== userId) {
        return res.status(403).json({
          status: 'error',
          message: '您沒有權限更新此聊天室',
        })
      }

      await ChatRoom.update(roomId, { name })
      res.json({
        status: 'success',
        message: '聊天室更新成功',
      })
    } catch (error) {
      console.error('更新聊天室錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '更新聊天室失敗',
      })
    }
  },

  // 刪除聊天室
  deleteRoom: async (req, res) => {
    try {
      const { roomId } = req.params
      const userId = req.user.user_id

      // 檢查權限
      const room = await ChatRoom.getById(roomId)
      if (!room) {
        return res.status(404).json({
          status: 'error',
          message: '找不到該聊天室',
        })
      }

      if (room.creator_id !== userId) {
        return res.status(403).json({
          status: 'error',
          message: '您沒有權限刪除此聊天室',
        })
      }

      await ChatRoom.delete(roomId)
      res.json({
        status: 'success',
        message: '聊天室刪除成功',
      })
    } catch (error) {
      console.error('刪除聊天室錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '刪除聊天室失敗',
      })
    }
  },

  // 取得聊天室成員
  getRoomMembers: async (req, res) => {
    try {
      const { roomId } = req.params
      const members = await ChatRoom.getMembers(roomId)
      res.json({
        status: 'success',
        data: members,
      })
    } catch (error) {
      console.error('取得聊天室成員錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '取得聊天室成員失敗',
      })
    }
  },

  // 加入聊天室
  joinRoom: async (req, res) => {
    try {
      const { roomId } = req.params
      const userId = req.user.user_id

      await chatService.joinRoom(roomId, userId)
      res.json({
        status: 'success',
        message: '成功加入聊天室',
      })
    } catch (error) {
      console.error('加入聊天室錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '加入聊天室失敗',
      })
    }
  },

  // 離開聊天室
  leaveRoom: async (req, res) => {
    try {
      const { roomId } = req.params
      const userId = req.user.user_id

      await ChatRoom.removeMember(roomId, userId)
      res.json({
        status: 'success',
        message: '成功離開聊天室',
      })
    } catch (error) {
      console.error('離開聊天室錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '離開聊天室失敗',
      })
    }
  },

  // === 群組相關方法 ===

  // 取得使用者的群組
  getUserGroups: async (req, res) => {
    try {
      const userId = req.user.user_id
      const groups = await ChatRoom.getUserGroups(userId)

      res.json({
        status: 'success',
        data: groups.map((group) => ({
          id: group.group_id,
          name: group.group_name,
          description: group.description,
          maxMembers: group.max_members,
          memberCount: group.member_count,
          createdAt: group.creat_time,
          groupTime: group.group_time,
          chatRoomId: group.chat_room_id,
          image: group.group_img,
          creatorId: group.creator_id,
        })),
      })
    } catch (error) {
      console.error('獲取用戶群組錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '獲取群組失敗',
      })
    }
  },

  // 建立群組聊天室
  createGroupChatRoom: async (req, res) => {
    try {
      const { groupName } = req.body
      const creatorId = req.user.user_id

      const result = await ChatRoom.createGroupChatRoom(groupName, creatorId)
      res.json({
        status: 'success',
        data: result,
        message: '群組聊天室建立成功',
      })
    } catch (error) {
      console.error('建立群組聊天室錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '建立群組聊天室失敗',
      })
    }
  },

  // 更新群組資訊
  updateGroup: async (req, res) => {
    try {
      const { groupId } = req.params
      const { groupName, description, maxMembers } = req.body
      const userId = req.user.user_id

      // 檢查群組是否存在並驗證權限
      const group = await ChatRoom.getGroupById(groupId)
      if (!group) {
        return res.status(404).json({
          status: 'error',
          message: '找不到該群組',
        })
      }

      if (group.creator_id !== userId) {
        return res.status(403).json({
          status: 'error',
          message: '您沒有權限更新此群組',
        })
      }

      await ChatRoom.updateGroup(groupId, {
        groupName,
        description,
        maxMembers,
      })

      res.json({
        status: 'success',
        message: '群組更新成功',
      })
    } catch (error) {
      console.error('更新群組錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '更新群組失敗',
      })
    }
  },

  // 刪除群組
  deleteGroup: async (req, res) => {
    try {
      const { groupId } = req.params
      const userId = req.user.user_id

      // 檢查群組是否存在並驗證權限
      const group = await ChatRoom.getGroupById(groupId)
      if (!group) {
        return res.status(404).json({
          status: 'error',
          message: '找不到該群組',
        })
      }

      if (group.creator_id !== userId) {
        return res.status(403).json({
          status: 'error',
          message: '您沒有權限刪除此群組',
        })
      }

      await ChatRoom.deleteGroup(groupId)

      res.json({
        status: 'success',
        message: '群組刪除成功',
      })
    } catch (error) {
      console.error('刪除群組錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '刪除群組失敗',
      })
    }
  },

  // 取得群組訊息
  getGroupMessages: async (req, res) => {
    try {
      const { groupId } = req.params
      const messages = await ChatRoom.getGroupMessages(groupId)

      res.json({
        status: 'success',
        data: messages.map((msg) => ({
          id: msg.id,
          content: msg.message,
          senderId: msg.sender_id,
          senderName: msg.sender_name,
          senderImage: msg.sender_image,
          groupId: msg.group_id,
          groupName: msg.group_name,
          createdAt: msg.created_at,
        })),
      })
    } catch (error) {
      console.error('獲取群組訊息錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '獲取訊息失敗',
      })
    }
  },

  // 取得群組成員
  getGroupMembers: async (req, res) => {
    try {
      const { groupId } = req.params
      const members = await ChatRoom.getGroupMembers(groupId)

      res.json({
        status: 'success',
        data: members.map((member) => ({
          userId: member.user_id,
          name: member.name,
          image: member.image_path,
          email: member.email,
          joinedAt: member.joined_at,
        })),
      })
    } catch (error) {
      console.error('取得群組成員錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '取得群組成員失敗',
      })
    }
  },

  // 加入群組
  joinGroup: async (req, res) => {
    try {
      const { groupId } = req.params
      const userId = req.user.user_id

      // 檢查是否已經是成員
      const isMember = await ChatRoom.isGroupMember(groupId, userId)
      if (isMember) {
        return res.status(400).json({
          status: 'error',
          message: '您已經是群組成員',
        })
      }

      // 獲取群組的聊天室ID
      const chatRoomId = await ChatRoom.getGroupChatRoomId(groupId)
      if (!chatRoomId) {
        return res.status(404).json({
          status: 'error',
          message: '找不到該群組的聊天室',
        })
      }

      await ChatRoom.addMember(chatRoomId, userId)

      res.json({
        status: 'success',
        message: '成功加入群組',
      })
    } catch (error) {
      console.error('加入群組錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '加入群組失敗',
      })
    }
  },

  // 離開群組
  leaveGroup: async (req, res) => {
    try {
      const { groupId } = req.params
      const userId = req.user.user_id

      const chatRoomId = await ChatRoom.getGroupChatRoomId(groupId)
      if (!chatRoomId) {
        return res.status(404).json({
          status: 'error',
          message: '找不到該群組的聊天室',
        })
      }

      await ChatRoom.removeMember(chatRoomId, userId)

      res.json({
        status: 'success',
        message: '成功離開群組',
      })
    } catch (error) {
      console.error('離開群組錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '離開群組失敗',
      })
    }
  },

  // === 聊天訊息相關方法 ===

  // 取得聊天室訊息
  getRoomMessages: async (req, res) => {
    try {
      const { roomId } = req.params
      const messages = await ChatRoom.getMessages(roomId)
      res.json({
        status: 'success',
        data: messages,
      })
    } catch (error) {
      console.error('取得聊天室訊息錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '取得聊天室訊息失敗',
      })
    }
  },

  // 發送一般訊息
  sendMessage: async (req, res) => {
    try {
      const { roomId } = req.params
      const { message } = req.body
      const senderId = req.user.user_id

      await ChatRoom.saveMessage({
        roomId,
        senderId,
        message,
      })

      res.json({
        status: 'success',
        message: '訊息發送成功',
      })
    } catch (error) {
      console.error('發送訊息錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '發送訊息失敗',
      })
    }
  },

  // === 私人訊息相關方法 ===

  // 取得私人訊息
  getPrivateMessages: async (req, res) => {
    try {
      const userId = req.user.user_id
      const { withUserId } = req.query

      if (!withUserId) {
        return res.status(400).json({
          status: 'error',
          message: '缺少必要參數',
        })
      }

      const messages = await ChatRoom.getPrivateMessages(userId, withUserId)
      res.json({
        status: 'success',
        data: messages.map((msg) => ({
          id: msg.id,
          content: msg.message,
          senderId: msg.sender_id,
          senderName: msg.sender_name,
          senderImage: msg.sender_image,
          recipientId: msg.recipient_id,
          createdAt: msg.created_at,
        })),
      })
    } catch (error) {
      console.error('取得私人訊息錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '取得私人訊息失敗',
      })
    }
  },

  // 發送私人訊息
  sendPrivateMessage: async (req, res) => {
    try {
      const { recipientId, message } = req.body
      const senderId = req.user.user_id

      if (!recipientId || !message) {
        return res.status(400).json({
          status: 'error',
          message: '缺少必要參數',
        })
      }

      // 檢查接收者是否存在
      const recipient = await ChatRoom.getUserById(recipientId)
      if (!recipient) {
        return res.status(404).json({
          status: 'error',
          message: '找不到接收者',
        })
      }

      // 儲存私人訊息
      await ChatRoom.saveMessage({
        senderId,
        message,
        isPrivate: true,
        recipientId,
      })

      // 通過 WebSocket 發送即時通知
      chatService.sendPrivateMessageNotification({
        from: senderId,
        to: recipientId,
        message,
      })

      res.json({
        status: 'success',
        message: '私人訊息發送成功',
      })
    } catch (error) {
      console.error('發送私人訊息錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '發送私人訊息失敗',
      })
    }
  },

  // === WebSocket 相關方法 ===

  // 處理 WebSocket 連接
  handleWebSocketConnection: async (ws, req) => {
    try {
      const userId = req.user.user_id

      // 儲存 WebSocket 連接
      chatService.addConnection(userId, ws)

      // 發送歡迎訊息
      ws.send(
        JSON.stringify({
          type: 'welcome',
          message: '成功連接到聊天服務器',
        })
      )

      // 監聽訊息
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message)
          await chatService.handleWebSocketMessage(ws, data)
        } catch (error) {
          console.error('處理 WebSocket 訊息錯誤:', error)
          ws.send(
            JSON.stringify({
              type: 'error',
              message: '處理訊息失敗',
            })
          )
        }
      })

      // 監聽關閉連接
      ws.on('close', () => {
        chatService.removeConnection(userId)
      })
    } catch (error) {
      console.error('處理 WebSocket 連接錯誤:', error)
      ws.close()
    }
  },

  // === 其他輔助方法 ===

  // 檢查使用者是否為聊天室成員
  checkRoomMembership: async (req, res, next) => {
    try {
      const { roomId } = req.params
      const userId = req.user.user_id

      const isMember = await ChatRoom.isMember(roomId, userId)
      if (!isMember) {
        return res.status(403).json({
          status: 'error',
          message: '您不是該聊天室的成員',
        })
      }

      next()
    } catch (error) {
      console.error('檢查成員資格錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '檢查成員資格失敗',
      })
    }
  },

  // 檢查群組成員資格
  checkGroupMembership: async (req, res, next) => {
    try {
      const { groupId } = req.params
      const userId = req.user.user_id

      const isMember = await ChatRoom.isGroupMember(groupId, userId)
      if (!isMember) {
        return res.status(403).json({
          status: 'error',
          message: '您不是該群組的成員',
        })
      }

      next()
    } catch (error) {
      console.error('檢查群組成員資格錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '檢查群組成員資格失敗',
      })
    }
  },
}

export default chatController
