import WebSocket from 'ws'

class WebSocketService {
  constructor() {
    this.ws = null
    this.listeners = {}
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.isConnecting = false
  }

  connect(userId) {
    if (this.isConnecting) return
    this.isConnecting = true

    try {
      console.log('Connecting to WebSocket server...')
      this.ws = new WebSocket('ws://localhost:3005')

      this.ws.onopen = () => {
        console.log('WebSocket connected successfully')
        this.isConnecting = false
        this.reconnectAttempts = 0

        // 建立連接後立即發送註冊訊息
        this.send({
          type: 'register',
          userID: userId,
        })
      }

      this.ws.onclose = () => {
        console.log('WebSocket connection closed')
        this.isConnecting = false
        this.ws = null

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++
            this.connect(userId)
          }, 3000)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.isConnecting = false
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('Received WebSocket message:', data)

          // 觸發對應的事件監聽器
          if (this.listeners[data.type]) {
            this.listeners[data.type](data)
          }
        } catch (error) {
          console.error('WebSocket message parsing error:', error)
        }
      }
    } catch (error) {
      console.error('WebSocket connection error:', error)
      this.isConnecting = false
    }
  }

  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('Sending message:', message)
      this.ws.send(JSON.stringify(message))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  on(type, callback) {
    this.listeners[type] = callback
  }

  off(type) {
    delete this.listeners[type]
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

const websocketService = new WebSocketService()
export default websocketService
