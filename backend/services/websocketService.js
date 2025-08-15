// websocketService.js｜PostgreSQL 版（完整覆蓋 + 區塊註解）
// [匯入] WebSocket 與 PostgreSQL 連線池（pgClient.js）
import WebSocket from 'ws'
import pool from '##/configs/pgClient.js'
// [類別] 負責管理 WebSocket 連線、重連、事件分發
class WebSocketService {
  // [建構子] 初始化連線狀態與事件監聽器容器
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.listeners = new Map()
    this.isConnecting = false
  }
  // [方法] 建立 WebSocket 連線並註冊使用者
  connect(userId) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) return
    this.isConnecting = true
    try {
      this.ws = new WebSocket('ws://localhost:3005')
      // [事件] 連線成功：重置狀態並向伺服器送出註冊訊息
      this.ws.onopen = () => {
        console.log('WebSocket連線成功')
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.send({ type: 'register', userID: userId })
      }
      // [事件] 收到訊息：處理 payload，必要時查詢資料庫補全資訊
      this.ws.onmessage = async (event) => {
        try {
          let data = JSON.parse(event.data)
          console.log('收到WebSocket消息:', data)
          // [分支] 新群組申請：查詢 PostgreSQL 取得發送者暱稱與頭像
          if (data.type === 'newGroupRequest') {
            const { rows } = await pool.query('SELECT name, image_path FROM users WHERE user_id = $1', [data.fromUser])
            const userData = rows[0]
            if (userData) data = { ...data, sender_name: userData.name, sender_image: userData.image_path }
          }
          // [事件分發] 依訊息類型呼叫所有已註冊的監聽器
          const listeners = this.listeners.get(data.type) || []
          listeners.forEach((callback) => callback(data))
        } catch (error) {
          console.error('處理WebSocket訊息時發生錯誤:', error)
        }
      }
      // [事件] 連線關閉：觸發重連流程
      this.ws.onclose = () => {
        console.log('WebSocket連線關閉')
        this.isConnecting = false
        this.handleReconnect(userId)
      }
      // [事件] 連線錯誤：記錄錯誤並重置連線中旗標
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
  // [方法] 重連邏輯：最多嘗試 maxReconnectAttempts 次，間隔 3 秒
  handleReconnect(userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`嘗試重新連線... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      setTimeout(() => {
        if (!this.isConnecting && (!this.ws || this.ws.readyState === WebSocket.CLOSED)) this.connect(userId)
      }, 3000)
    } else {
      console.log('達到最大重新連線次數，停止重新連線')
    }
  }
  // [方法] 傳送訊息：系統訊息格式化後再送出
  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        let messageToSend = { ...data }
        if (data.type === 'system' || data.type === 'memberJoined' || data.type === 'memberLeft' || data.type === 'groupRequestResult') {
          const dateTime = this.formatDateTime()
          const action = data.type === 'memberLeft' ? '已離開群組' : '已加入群組'
          messageToSend = { ...messageToSend, content: data.gameId ? `${dateTime} ${data.gameId} ${action}` : data.content }
        }
        this.ws.send(JSON.stringify(messageToSend))
      } catch (error) {
        console.error('發送WebSocket訊息時發生錯誤:', error)
      }
    } else {
      console.warn('WebSocket未連線，無法發送訊息')
    }
  }
  // [方法] 註冊事件監聽器：以資料型態為 key 儲存 callbacks
  on(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, [])
    this.listeners.get(type).push(callback)
  }
  // [方法] 取消特定事件監聽器
  off(type, callback) {
    if (!this.listeners.has(type)) return
    const listeners = this.listeners.get(type)
    const index = listeners.indexOf(callback)
    if (index !== -1) listeners.splice(index, 1)
  }
  // [方法] 主動中斷連線並重置狀態
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.listeners.clear()
    this.reconnectAttempts = 0
    this.isConnecting = false
  }
  // [工具] 產生 yyyy-mm-dd hh:mm 的時間字串
  formatDateTime() {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mi = String(d.getMinutes()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
  }
}
// [單例輸出] 匯出服務實例供全站使用
const websocketService = new WebSocketService()
export default websocketService
