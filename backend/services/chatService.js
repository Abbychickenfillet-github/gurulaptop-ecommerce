import WebSocket from 'ws'
import { ChatRoom } from '../models/ChatRoom.js'

class ChatService {
  constructor() {
    this.clients = new Map()
    this.rooms = new Map()
  }

  handleConnection(ws, req) {
    console.log('新的 WebSocket 連接已建立')

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString())
        await this.handleMessage(ws, data)
      } catch (error) {
        console.error('處理訊息錯誤:', error)
        ws.send(
          JSON.stringify({
            type: 'error',
            message: '處理訊息時發生錯誤',
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
  }

  async handleMessage(ws, data) {
    console.log('收到訊息:', data)

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
    ws.userID = userID
    this.clients.set(userID, ws)

    ws.send(
      JSON.stringify({
        type: 'registered',
        success: true,
      })
    )

    console.log(`用戶 ${userID} 已註冊`)
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

      if (status === 'accepted') {
        await ChatRoom.addGroupMember(request.group_id, request.sender_id)

        if (request.chat_room_id) {
          await ChatRoom.addMember(request.chat_room_id, request.sender_id)
        }
      }

      const applicantWs = this.clients.get(request.sender_id)
      if (applicantWs?.readyState === WebSocket.OPEN) {
        applicantWs.send(
          JSON.stringify({
            type: 'groupRequestResult',
            status,
            groupId: request.group_id,
            message:
              message ||
              (status === 'accepted' ? '您的申請已被接受' : '您的申請已被拒絕'),
            timestamp: new Date().toISOString(),
          })
        )
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

  async handleChatMessage(ws, data) {
    const { roomId, message, senderId, isPrivate, recipientId } = data

    try {
      // 儲存訊息
      const messageId = await ChatRoom.saveMessage({
        roomId,
        senderId,
        message,
        isPrivate,
        recipientId,
      })

      const messageData = {
        type: 'message',
        messageId,
        senderId,
        message,
        timestamp: new Date().toISOString(),
        roomId,
      }

      if (isPrivate && recipientId) {
        const recipientWs = this.clients.get(recipientId)
        if (recipientWs?.readyState === WebSocket.OPEN) {
          recipientWs.send(JSON.stringify(messageData))
        }
      } else {
        this.broadcastToRoom(roomId, messageData, ws)
      }
    } catch (error) {
      console.error('處理聊天訊息錯誤:', error)
      ws.send(
        JSON.stringify({
          type: 'error',
          message: '發送訊息失敗',
        })
      )
    }
  }

  async handleJoinRoom(ws, { roomId, userId }) {
    try {
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, new Set())
      }

      this.rooms.get(roomId).add(ws)
      ws.roomId = roomId

      const members = await ChatRoom.getMembers(roomId)
      ws.send(
        JSON.stringify({
          type: 'roomJoined',
          roomId,
          members,
        })
      )

      this.broadcastToRoom(
        roomId,
        {
          type: 'memberJoined',
          userId,
          roomId,
        },
        ws
      )
    } catch (error) {
      console.error('加入房間錯誤:', error)
      ws.send(
        JSON.stringify({
          type: 'error',
          message: '加入房間失敗',
        })
      )
    }
  }

  async handleLeaveRoom(ws, { roomId, userId }) {
    try {
      const roomClients = this.rooms.get(roomId)
      if (roomClients) {
        roomClients.delete(ws)
        delete ws.roomId

        this.broadcastToRoom(roomId, {
          type: 'memberLeft',
          userId,
          roomId,
        })
      }
    } catch (error) {
      console.error('離開房間錯誤:', error)
    }
  }

  handleDisconnection(ws) {
    if (ws.userID) {
      this.clients.delete(ws.userID)

      if (ws.roomId) {
        const roomClients = this.rooms.get(ws.roomId)
        if (roomClients) {
          roomClients.delete(ws)
          this.broadcastToRoom(ws.roomId, {
            type: 'memberDisconnected',
            userId: ws.userID,
          })
        }
      }

      console.log(`用戶 ${ws.userID} 已斷開連接`)
    }
  }

  broadcastToRoom(roomId, message, excludeWs = null) {
    const messageStr = JSON.stringify(message)
    const roomClients = this.rooms.get(roomId)
    if (roomClients) {
      roomClients.forEach((client) => {
        if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
          client.send(messageStr)
        }
      })
    }
  }
}

export const chatService = new ChatService()
