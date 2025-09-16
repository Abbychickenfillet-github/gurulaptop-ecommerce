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
    
    // 🔧 修復：新增 currentUserId 屬性
    // 原因：重連時需要知道要註冊哪個用戶
    // 好處：避免重連時無法正確註冊用戶，防止無限重連循環
    this.currentUserId = null // 儲存當前用戶ID，用於重連
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

    // 🔧 修復：儲存用戶ID用於重連
    // 原因：重連時需要知道要註冊哪個用戶，避免重連失敗
    // 好處：確保重連後能正確註冊用戶，維持功能正常運作
    this.currentUserId = userId
    this.isConnecting = true

    // 根據環境決定 WebSocket URL
    const wsUrl = process.env.NODE_ENV === 'production' 
      ? 'wss://guru-laptop-lavendarbug-vqq.zeabur.app'
      : 'ws://localhost:3005'

    console.log('🔌 WebSocket 連線到:', wsUrl)

    // 建立WebSocket連線
    this.ws = new WebSocket(wsUrl)

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
      // 🔧 修復：等待3秒後重新連線，使用儲存的用戶ID
      // 原因：重連時必須傳遞 userId 參數，否則無法正確註冊用戶
      // 好處：避免重連失敗導致的無限循環，確保功能正常運作
      setTimeout(() => {
        if (this.ws?.readyState === WebSocketState.CLOSED && this.currentUserId) {
          this.connect(this.currentUserId) // ✅ 使用儲存的用戶ID重連
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
      
      // 🔧 修復：清除用戶ID
      // 原因：斷線時應該清除所有狀態，包括用戶ID
      // 好處：確保下次連接時使用新的用戶ID，避免狀態混亂
      this.currentUserId = null // 清除用戶ID
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
