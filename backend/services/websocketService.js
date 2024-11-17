import WebSocket from 'ws'
import db from '../configs/mysql.js'
import ChatRoom from '../models/ChatRoom.js'

class WebSocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.messageQueue = []
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.listeners = new Map()
  }

  connect(userId) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return
    }

    this.socket = new WebSocket('ws://localhost:3005')

    this.socket.onopen = () => {
      console.log('WebSocket connected')
      this.isConnected = true
      this.reconnectAttempts = 0

      // 連接成功後註冊用戶
      this.send({
        type: 'register',
        userID: userId,
      })

      // 發送佇列中的訊息
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift()
        this.send(message)
      }
    }

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('Received message:', data)

        // 通知所有監聽器
        const listeners = this.listeners.get(data.type) || []
        listeners.forEach((callback) => callback(data))
      } catch (error) {
        console.error('Error processing message:', error)
      }
    }

    this.socket.onclose = () => {
      console.log('WebSocket disconnected')
      this.isConnected = false

      // 嘗試重新連接
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        setTimeout(() => this.connect(userId), 1000 * this.reconnectAttempts)
      }
    }

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }
  send(message) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.log('WebSocket not connected, queueing message')
      this.messageQueue.push(message)
      // 如果斷線，嘗試重新連接
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.connect(message.fromID || message.userID)
      }
      return
    }

    try {
      this.socket.send(JSON.stringify(message))
    } catch (error) {
      console.error('Error sending message:', error)
      this.messageQueue.push(message)
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
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
      this.isConnected = false
    }
  }
}

const websocketService = new WebSocketService()
export default websocketService
