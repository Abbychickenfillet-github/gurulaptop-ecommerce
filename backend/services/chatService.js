import WebSocket from 'ws'
import { ChatRoom } from '../models/ChatRoom.js'
import db from '../configs/mysql.js'

class ChatService {
  constructor() {
    this.clients = new Map()
    this.rooms = new Map()
    this.messageQueue = new Map()
  }

  handleConnection(ws, req) {
    console.log('新的 WebSocket 連接已建立')

    ws.isAlive = true
    ws.on('pong', () => {
      ws.isAlive = true
    })

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString())
        console.log('收到訊息:', data)
        await this.handleMessage(ws, data)
      } catch (error) {
        console.error('處理訊息錯誤:', error)
        ws.send(
          JSON.stringify({
            type: 'error',
            message: '處理訊息時發生錯誤',
            error: error.message,
          })
        )
      }
    })

    ws.on('close', () => {
      this.handleDisconnection(ws)
    })

    ws.on('error', (error) => {
      console.error('WebSocket 客戶端錯誤:', error)
    })

    // 定期檢查連線狀態
    const pingInterval = setInterval(() => {
      if (ws.isAlive === false) {
        clearInterval(pingInterval)
        return ws.terminate()
      }
      ws.isAlive = false
      ws.ping()
    }, 30000)
  }

  async handleMessage(ws, data) {
    switch (data.type) {
      case 'register':
        await this.handleRegisterUser(ws, data)
        break
      case 'groupRequest':
        await this.handleGroupRequest(ws, data)
        break
      case 'groupRequestResponse':
        await this.handleGroupRequestResponse(ws, data)
        break
      case 'message':
        await this.handleChatMessage(ws, data)
        break
      case 'joinRoom':
        await this.handleJoinRoom(ws, data)
        break
      case 'leaveRoom':
        await this.handleLeaveRoom(ws, data)
        break
      default:
        console.warn('未知的訊息類型:', data.type)
    }
  }

  async handleRegisterUser(ws, data) {
    const { userID } = data

    try {
      ws.userID = userID
      this.clients.set(userID, ws)

      // 處理離線訊息
      const pendingMessages = this.messageQueue.get(userID) || []
      while (pendingMessages.length > 0) {
        const message = pendingMessages.shift()
        ws.send(JSON.stringify(message))
      }
      this.messageQueue.delete(userID)

      ws.send(
        JSON.stringify({
          type: 'registered',
          success: true,
          userId: userID,
          timestamp: new Date().toISOString(),
        })
      )

      console.log(`用戶 ${userID} 已註冊`)
    } catch (error) {
      console.error('註冊使用者錯誤:', error)
      ws.send(
        JSON.stringify({
          type: 'error',
          message: '註冊失敗',
        })
      )
    }
  }

  async handleChatMessage(ws, data) {
    const { roomID, message, fromID } = data

    try {
      const connection = await db.getConnection()
      try {
        await connection.beginTransaction()

        // 檢查發送者是否為群組成員
        const [[memberCheck]] = await connection.execute(
          `SELECT gm.* 
           FROM group_members gm
           JOIN \`group\` g ON gm.group_id = g.group_id
           WHERE g.chat_room_id = ? AND gm.member_id = ? 
           AND gm.status = 'accepted'`,
          [roomID, fromID]
        )

        if (!memberCheck) {
          throw new Error('您不是該群組的成員')
        }

        // 儲存訊息
        const [result] = await connection.execute(
          'INSERT INTO chat_messages (room_id, sender_id, message, is_private, is_system) VALUES (?, ?, ?, 0, 0)',
          [roomID, fromID, message]
        )

        // 獲取發送者資訊
        const [[userData]] = await connection.execute(
          'SELECT name as sender_name, image_path as sender_image FROM users WHERE user_id = ?',
          [fromID]
        )

        await connection.commit()

        const messageData = {
          type: 'message',
          id: result.insertId,
          room_id: roomID,
          sender_id: fromID,
          sender_name: userData.sender_name || '未知用戶',
          sender_image: userData.sender_image,
          message: message,
          created_at: new Date().toISOString(),
        }

        // 廣播訊息給房間所有成員
        this.broadcastToRoom(roomID, messageData)
      } catch (error) {
        await connection.rollback()
        throw error
      } finally {
        connection.release()
      }
    } catch (error) {
      console.error('處理群組訊息錯誤:', error)
      ws.send(
        JSON.stringify({
          type: 'error',
          message: error.message || '發送訊息失敗',
        })
      )
    }
  }

  async handleGroupRequest(ws, { fromID, groupId, gameId, description }) {
    try {
      const group = await ChatRoom.getGroupById(groupId)
      if (!group) throw new Error('找不到該群組')

      const creatorWs = this.clients.get(group.creator_id)
      if (creatorWs?.readyState === WebSocket.OPEN) {
        creatorWs.send(
          JSON.stringify({
            type: 'newGroupRequest',
            requestId: group.id,
            fromUser: fromID,
            gameId,
            description,
            groupName: group.group_name,
            timestamp: new Date().toISOString(),
          })
        )
      }

      // 儲存申請記錄
      const requestId = await ChatRoom.saveGroupRequest({
        groupId,
        senderId: fromID,
        creatorId: group.creator_id,
        gameId,
        description,
      })

      // 發送確認給申請者
      ws.send(
        JSON.stringify({
          type: 'groupRequestSent',
          success: true,
          requestId,
          groupId,
        })
      )
    } catch (error) {
      console.error('處理群組申請錯誤:', error)
      ws.send(
        JSON.stringify({
          type: 'error',
          message: error.message,
        })
      )
    }
  }

  async handleGroupRequestResponse(ws, { requestId, status, message }) {
    try {
      const request = await ChatRoom.getGroupRequestById(requestId)
      if (!request) throw new Error('找不到該申請')

      await ChatRoom.updateGroupRequest(requestId, { status })

      const connection = await db.getConnection()
      try {
        await connection.beginTransaction()

        if (status === 'accepted') {
          // 加入群組成員
          await ChatRoom.addGroupMember(request.group_id, request.sender_id)

          // 獲取申請者資訊
          const [[userData]] = await connection.execute(
            'SELECT name, game_id FROM group_requests WHERE id = ?',
            [requestId]
          )

          // 獲取群組聊天室 ID
          const [[groupData]] = await connection.execute(
            'SELECT chat_room_id FROM `group` WHERE group_id = ?',
            [request.group_id]
          )

          if (groupData.chat_room_id) {
            // 新增系統訊息
            const systemMessage = JSON.stringify({
              type: 'system',
              content: `${userData.game_id || '使用者'} 已加入群組`,
            })

            // 儲存系統訊息
            await connection.execute(
              'INSERT INTO chat_messages (room_id, sender_id, message, is_system) VALUES (?, 0, ?, 1)',
              [groupData.chat_room_id, systemMessage]
            )

            // 廣播系統訊息
            this.broadcastToRoom(groupData.chat_room_id, {
              type: 'system',
              content: `${userData.game_id || '使用者'} 已加入群組`,
              created_at: new Date().toISOString(),
            })
          }
        }

        await connection.commit()

        // 通知申請者結果
        const applicantWs = this.clients.get(request.sender_id)
        if (applicantWs?.readyState === WebSocket.OPEN) {
          applicantWs.send(
            JSON.stringify({
              type: 'groupRequestResult',
              requestId,
              status,
              message:
                message ||
                (status === 'accepted'
                  ? '您的申請已被接受'
                  : '您的申請已被拒絕'),
              timestamp: new Date().toISOString(),
            })
          )
        }
      } catch (error) {
        await connection.rollback()
        throw error
      } finally {
        connection.release()
      }
    } catch (error) {
      console.error('處理群組申請回應錯誤:', error)
      ws.send(
        JSON.stringify({
          type: 'error',
          message: error.message,
        })
      )
    }
  }

  async handleJoinRoom(ws, { roomID, fromID }) {
    try {
      const connection = await db.getConnection()
      try {
        // 檢查是否為群組成員
        const [[memberCheck]] = await connection.execute(
          `SELECT gm.* 
           FROM group_members gm
           JOIN \`group\` g ON gm.group_id = g.group_id
           WHERE g.chat_room_id = ? AND gm.member_id = ? 
           AND gm.status = 'accepted'`,
          [roomID, fromID]
        )

        if (!memberCheck) {
          throw new Error('您不是該群組的成員')
        }

        // 將用戶加入房間
        if (!this.rooms.has(roomID)) {
          this.rooms.set(roomID, new Set())
        }

        const room = this.rooms.get(roomID)
        room.add(ws)
        ws.roomID = roomID

        // 獲取房間資訊和成員
        const [[groupInfo]] = await connection.execute(
          `SELECT 
            g.*, 
            COUNT(gm.member_id) as member_count
           FROM \`group\` g
           LEFT JOIN group_members gm ON g.group_id = gm.group_id
           WHERE g.chat_room_id = ? AND gm.status = 'accepted'
           GROUP BY g.group_id`,
          [roomID]
        )

        // 獲取歷史訊息
        const [messages] = await connection.execute(
          `SELECT 
            cm.*,
            u.name as sender_name,
            u.image_path as sender_image
           FROM chat_messages cm
           JOIN users u ON cm.sender_id = u.user_id
           WHERE cm.room_id = ?
           ORDER BY cm.created_at ASC
           LIMIT 50`,
          [roomID]
        )

        // 發送加入成功訊息
        ws.send(
          JSON.stringify({
            type: 'roomJoined',
            roomId: roomID,
            groupInfo: {
              id: groupInfo.group_id,
              name: groupInfo.group_name,
              memberCount: groupInfo.member_count,
              maxMembers: groupInfo.max_members,
            },
            messages: messages.map((msg) => ({
              id: msg.id,
              sender_id: msg.sender_id,
              sender_name: msg.sender_name,
              sender_image: msg.sender_image,
              message: msg.message,
              created_at: msg.created_at,
              is_system: msg.is_system,
            })),
            timestamp: new Date().toISOString(),
          })
        )

        // 廣播成員加入訊息
        this.broadcastToRoom(roomID, {
          type: 'memberJoined',
          userId: fromID,
          roomId: roomID,
          timestamp: new Date().toISOString(),
        })
      } finally {
        connection.release()
      }
    } catch (error) {
      console.error('加入房間錯誤:', error)
      ws.send(
        JSON.stringify({
          type: 'error',
          message: error.message || '加入房間失敗',
        })
      )
    }
  }

  async handleLeaveRoom(ws, { roomID, fromID }) {
    try {
      const room = this.rooms.get(roomID)
      if (room) {
        room.delete(ws)
        delete ws.roomID

        // 廣播成員離開訊息
        this.broadcastToRoom(roomID, {
          type: 'memberLeft',
          userId: fromID,
          roomId: roomID,
          timestamp: new Date().toISOString(),
        })

        if (room.size === 0) {
          this.rooms.delete(roomID)
        }
      }
    } catch (error) {
      console.error('離開房間錯誤:', error)
    }
  }

  handleDisconnection(ws) {
    if (ws.userID) {
      this.clients.delete(ws.userID)

      if (ws.roomID) {
        const room = this.rooms.get(ws.roomID)
        if (room) {
          room.delete(ws)
          this.broadcastToRoom(ws.roomID, {
            type: 'memberDisconnected',
            userId: ws.userID,
            timestamp: new Date().toISOString(),
          })

          if (room.size === 0) {
            this.rooms.delete(ws.roomID)
          }
        }
      }

      console.log(`用戶 ${ws.userID} 已斷開連接`)
    }
  }

  broadcastToRoom(roomId, message) {
    const room = this.rooms.get(roomId)
    if (room) {
      const messageStr = JSON.stringify(message)
      room.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          try {
            client.send(messageStr)
          } catch (error) {
            console.error('發送訊息失敗:', error)
          }
        }
      })
    }
  }

  handleMemberUpdate(ws, data) {
    const { groupId, chatRoomId } = data
    this.broadcastToRoom(chatRoomId, {
      type: 'groupMemberUpdate',
      ...data,
      timestamp: new Date().toISOString(),
    })
  }

  async sendSystemMessage(roomId, content) {
    const connection = await db.getConnection()
    try {
      const [result] = await connection.execute(
        'INSERT INTO chat_messages (room_id, sender_id, message, is_system) VALUES (?, 0, ?, 1)',
        [roomId, content]
      )

      this.broadcastToRoom(roomId, {
        type: 'system',
        id: result.insertId,
        content,
        created_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error('發送系統訊息錯誤:', error)
    } finally {
      connection.release()
    }
  }
}

export const chatService = new ChatService()
