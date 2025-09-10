# Cursor 個人化備忘錄

**建立時間**: 2025年9月10日  
**最後更新**: 2025年9月10日

## 重要注意事項

### 🚨 文檔放置規則
**絕對不能在 `backend/routes/` 目錄下放置 `.md` 檔案！**
- **原因**: 會導致後端終端機中斷
- **正確位置**: 根目錄下的 `error-log/` 資料夾
- **影響**: 所有 routes 相關的錯誤文檔都必須放在 `error-log/` 下

### 📁 文檔放置規範
```
✅ 正確位置:
- error-log/group-pending-column-error.md
- error-log/websocket-environment-fix.md
- error-log/CHAT_PROBLEMS_SUMMARY.md

❌ 錯誤位置:
- backend/routes/group-pending-column-error.md (會中斷後端)
- backend/routes/websocket-environment-fix.md (會中斷後端)
```

### 🔗 檔案依賴關係
**ChatRoom 使用鏈 (不可刪除):**
```
models/ChatRoom.js 
    ↓ 被使用
controllers/chatController.js 
    ↓ 被使用  
routes/chat.js
    ↓ 被使用
前端聊天室功能
```

**重要**: 整個鏈條都不能刪除，每個環節都有實際使用。

### 🛠️ 開發環境配置
- **WebSocket**: 開發環境使用 `ws://localhost:3005`，生產環境使用 `wss://guru-laptop-lavendarbug-vqq.zeabur.app`
- **資料庫**: PostgreSQL，注意 MySQL 到 PostgreSQL 的語法差異
- **認證**: JWT token 需要 `httpOnly: false` 讓前端可以讀取

### 📝 錯誤文檔命名規範
- 使用 kebab-case: `group-pending-column-error.md`
- 包含問題類型: `error`, `fix`, `issue`
- 放在對應的 `error-log/` 資料夾下

## 更新時間
最後更新: 2025年9月10日
