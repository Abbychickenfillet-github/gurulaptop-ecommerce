# WebSocket 連線環境配置錯誤

**發生時間**: 2025年9月10日  
**問題回報**: 用戶詢問 WebSocket 連接到 Zeabur 而非本地環境的問題

## 問題描述
在開發環境中，WebSocket 服務錯誤地連接到 Zeabur 生產環境 (`wss://guru-laptop-lavendarbug-vqq.zeabur.app`) 而非本地開發環境 (`ws://localhost:3005`)。

## 錯誤現象
```
🔌 WebSocket 連線到: wss://guru-laptop-lavendarbug-vqq.zeabur.app
```

**預期行為:**
```
🔌 WebSocket 連線到: ws://localhost:3005
```
## 根本原因
`frontend/services/websocketService.js` 第 31 行硬編碼了生產環境的 WebSocket URL，沒有根據 `NODE_ENV` 環境變數來區分開發和生產環境。

## 解決方案
**根據環境變數動態選擇 WebSocket URL:**

```javascript
// 修改前 (錯誤)
this.ws = new WebSocket('wss://guru-laptop-lavendarbug-vqq.zeabur.app')

// 修改後 (正確)
const wsUrl = process.env.NODE_ENV === 'production' 
  ? 'wss://guru-laptop-lavendarbug-vqq.zeabur.app'
  : 'ws://localhost:3005'

console.log('🔌 WebSocket 連線到:', wsUrl)
this.ws = new WebSocket(wsUrl)
```

## 環境配置

### 開發環境
- **WebSocket URL**: `ws://localhost:3005`
- **NODE_ENV**: `development`
- **用途**: 本地開發和測試

### 生產環境
- **WebSocket URL**: `wss://guru-laptop-lavendarbug-vqq.zeabur.app`
- **NODE_ENV**: `production`
- **用途**: Zeabur 部署

## 影響範圍
- 所有使用 WebSocket 的功能（聊天室、群組申請等）
- 開發環境的即時通訊功能
- 本地測試和除錯

## 預防措施
1. **環境變數檢查**: 確保所有外部連線都使用環境變數
2. **配置分離**: 將開發和生產環境的配置分開
3. **本地測試**: 在開發時確保連接到本地服務

## 相關檔案
- `frontend/services/websocketService.js`
- `frontend/.env.local` (開發環境變數)
- `frontend/.env.production` (生產環境變數)

## 測試方法
1. 在開發環境中檢查控制台輸出
2. 確認 WebSocket 連接到 `ws://localhost:3005`
3. 測試聊天室和群組申請功能
