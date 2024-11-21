// WebSocket連線的狀態常數
const WebSocketState = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
}

class WebSocketService {
  constructor() {
    this.ws = null // WebSocket實例
    this.reconnectAttempts = 0 // 重新連線嘗試次數
    this.maxReconnectAttempts = 5 // 最大重新連線次數
    this.listeners = new Map() // 事件監聽器
    this.isConnecting = false // 是否正在連線中
  }

  // 建立WebSocket連線
  connect(userId) {
    // 如果已經連線中或正在連線，則不重複連線
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocketState.OPEN)
    ) {
      return
    }

    this.isConnecting = true

    // 建立WebSocket連線
    this.ws = new WebSocket('ws://localhost:3005')

    // 連線成功時的處理
    this.ws.onopen = () => {
      console.log('WebSocket連線成功')
      this.isConnecting = false
      this.reconnectAttempts = 0

      // 發送註冊訊息
      this.send({
        type: 'register',
        userID: userId,
      })
    }

    // 接收訊息的處理
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        // 觸發對應類型的事件監聽器
        const listeners = this.listeners.get(data.type) || []
        listeners.forEach((callback) => callback(data))
      } catch (error) {
        console.error('處理WebSocket訊息時發生錯誤:', error)
      }
    }

    // 連線關閉時的處理
    this.ws.onclose = () => {
      console.log('WebSocket連線關閉')
      this.isConnecting = false
      this.handleReconnect()
    }

    // 發生錯誤時的處理
    this.ws.onerror = (error) => {
      console.error('WebSocket錯誤:', error)
      this.isConnecting = false
    }
  }

  // 處理重新連線
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(
        `嘗試重新連線... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      )
      // 等待3秒後重新連線
      setTimeout(() => {
        if (this.ws?.readyState === WebSocketState.CLOSED) {
          this.connect()
        }
      }, 3000)
    } else {
      console.log('達到最大重新連線次數，停止重新連線')
    }
  }

  // 發送訊息
  send(data) {
    if (this.ws?.readyState === WebSocketState.OPEN) {
      try {
        this.ws.send(JSON.stringify(data))
      } catch (error) {
        console.error('發送WebSocket訊息時發生錯誤:', error)
      }
    } else {
      console.warn('WebSocket未連線，無法發送訊息')
    }
  }

  // 新增事件監聽器
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type).push(callback)
  }

  // 移除事件監聽器
  off(type, callback) {
    if (!this.listeners.has(type)) return
    const listeners = this.listeners.get(type)
    const index = listeners.indexOf(callback)
    if (index !== -1) {
      listeners.splice(index, 1)
    }
  }

  // 關閉WebSocket連線
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.listeners.clear()
      this.reconnectAttempts = 0
      this.isConnecting = false
    }
  }

  // 取得連線狀態
  getStatus() {
    if (!this.ws) return 'DISCONNECTED'
    switch (this.ws.readyState) {
      case WebSocketState.CONNECTING:
        return 'CONNECTING'
      case WebSocketState.OPEN:
        return 'CONNECTED'
      case WebSocketState.CLOSING:
        return 'CLOSING'
      case WebSocketState.CLOSED:
        return 'CLOSED'
      default:
        return 'UNKNOWN'
    }
  }
}

// 建立單例實例
const websocketService = new WebSocketService()
export default websocketService
