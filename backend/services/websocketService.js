import WebSocket from 'ws'
import db from '../configs/mysql.js'
import ChatRoom from '../models/ChatRoom.js'

class WebSocketService {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.listeners = new Map()
    this.isConnecting = false
  }

  connect(userId) {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      return
    }

    this.isConnecting = true

    try {
      this.ws = new WebSocket('ws://localhost:3005')

      this.ws.onopen = () => {
        console.log('WebSocket連線成功')
        this.isConnecting = false
        this.reconnectAttempts = 0

        this.send({
          type: 'register',
          userID: userId,
        })
      }

      this.ws.onmessage = async (event) => {
        try {
          let data = JSON.parse(event.data)
          console.log('收到WebSocket消息:', data)

          // 處理新的群組申請
          if (data.type === 'newGroupRequest') {
            const [[userData]] = await db.execute(
              'SELECT name, image_path FROM users WHERE user_id = ?',
              [data.fromUser]
            )

            data = {
              ...data,
              sender_name: userData.name,
              sender_image: userData.image_path,
            }
          }

          // 發送消息給所有監聽器
          const listeners = this.listeners.get(data.type) || []
          listeners.forEach((callback) => callback(data))
        } catch (error) {
          console.error('處理WebSocket訊息時發生錯誤:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket連線關閉')
        this.isConnecting = false
        this.handleReconnect(userId)
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket錯誤:', error)
        this.isConnecting = false
      }
    } catch (error) {
      console.error('建立WebSocket連線時發生錯誤:', error)
      this.isConnecting = false
      this.handleReconnect(userId)
    }
  }

  handleReconnect(userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(
        `嘗試重新連線... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      )

      setTimeout(() => {
        if (
          !this.isConnecting &&
          (!this.ws || this.ws.readyState === WebSocket.CLOSED)
        ) {
          this.connect(userId)
        }
      }, 3000)
    } else {
      console.log('達到最大重新連線次數，停止重新連線')
    }
  }

  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        let messageToSend = { ...data }

        if (
          data.type === 'system' ||
          data.type === 'memberJoined' ||
          data.type === 'memberLeft' ||
          data.type === 'groupRequestResult'
        ) {
          const dateTime = this.formatDateTime()
          const action =
            data.type === 'memberLeft' ? '已離開群組' : '已加入群組'

          messageToSend = {
            ...messageToSend,
            content: data.gameId
              ? `${dateTime} ${data.gameId} ${action}`
              : data.content,
          }
        }

        this.ws.send(JSON.stringify(messageToSend))
      } catch (error) {
        console.error('發送WebSocket訊息時發生錯誤:', error)
      }
    } else {
      console.warn('WebSocket未連線，無法發送訊息')
    }
  }

  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type).push(callback)
  }

  off(type, callback) {
    if (!this.listeners.has(type)) return
    const listeners = this.listeners.get(type)
    const index = listeners.indexOf(callback)
    if (index !== -1) {
      listeners.splice(index, 1)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.listeners.clear()
    this.reconnectAttempts = 0
    this.isConnecting = false
  }
}

const websocketService = new WebSocketService()
export default websocketService
