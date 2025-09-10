# ChatRoom 物件錯誤放置問題 (`configs/pgClient.js` 被替換)

## 問題描述
`configs/pgClient.js` 檔案被錯誤地替換為 `ChatRoom` 物件，導致資料庫連線配置丟失，聊天室相關功能無法正常運作。

## 錯誤現象
- `configs/pgClient.js` 包含 `ChatRoom` 物件而非資料庫連線池配置
- 資料庫連線失敗
- 聊天室功能無法使用

## 根本原因
`ChatRoom` 物件被錯誤地放置在 `configs/` 目錄中，而不是正確的 `models/` 目錄。這導致：
1. 資料庫連線配置丟失
2. 架構混亂（業務邏輯放在配置檔案中）

## 解決方案
**將 `ChatRoom` 物件移動到正確位置:**

1. **恢復 `configs/pgClient.js`** 為正確的資料庫連線配置
2. **將 `ChatRoom` 物件合併到 `models/ChatRoom.js`**
3. **更新 import 路徑**

**正確的 `configs/pgClient.js` 內容:**
```javascript
import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

export default pool
```

**正確的 `models/ChatRoom.js` 內容:**
```javascript
import pool from '../configs/pgClient.js'

export const ChatRoom = {
  create: async ({ roomName, creatorId }) => { /* ... */ },
  getAll: async () => { /* ... */ },
  // ... 其他方法
}

export default ChatRoom
```

## 架構原則
- **`configs/`**: 只包含配置檔案（資料庫連線、環境變數等）
- **`models/`**: 包含資料模型和業務邏輯
- **`routes/`**: 包含 API 路由處理
- **`controllers/`**: 包含控制器邏輯

## 影響範圍
- 所有依賴 `pgClient` 的檔案
- 聊天室相關功能
- 資料庫連線

## 預防措施
1. 遵循 MVC 架構原則
2. 配置檔案只包含配置，不包含業務邏輯
3. 定期檢查檔案放置位置是否正確

## 相關檔案
- `configs/pgClient.js` (需要恢復)
- `models/ChatRoom.js` (需要合併)
- `controllers/chatController.js`
- `routes/chat.js`
