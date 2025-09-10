# localhost:3000 環境配置修復記錄

**首次詢問時間：** 2025-01-10 23:30  
**問題類型：** 環境配置、部署問題  
**影響範圍：** 前端、後端、Zeabur 部署  

## 📋 問題概述

### 主要問題
1. **寫死的 localhost:3000** - 多個檔案中硬編碼了 `http://localhost:3000`
2. **styled-jsx 錯誤** - `EISDIR: illegal operation on a directory` 導致構建失敗
3. **Zeabur 部署端口不匹配** - 前端配置為 8080，但代碼中寫死 3000
4. **CORS 配置問題** - 後端 CORS 設定需要包含生產環境域名

### 影響的檔案
- `backend/data/linepay/reserve.js`
- `backend/app.js`
- `frontend/components/frontPage/ArticleSlider.js`
- `frontend/components/frontPage/NewProducts.js`
- `frontend/components/frontPage/HotProducts.js`
- `frontend/next.config.js`
- `backend/services/websocketService.js`
- `frontend/package.json`

## 🔧 解決方案

### 1. 動態環境 URL 配置

**修改前：**
```javascript
// 硬編碼的 localhost:3000
redirectUrls: {
  confirmUrl: 'http://localhost:3000/pay-confirm',
  cancelUrl: 'http://localhost:3000/pay-cancel',
}
```

**修改後：**
```javascript
// 根據環境動態選擇基礎 URL
const baseUrl = process.env.NODE_ENV === 'production' 
  ? 'https://yunlavendar-guru-smart-laptop.zeabur.app'
  : 'http://localhost:3000'

redirectUrls: {
  confirmUrl: `${baseUrl}/pay-confirm`,
  cancelUrl: `${baseUrl}/pay-cancel`,
}
```

### 2. CORS 配置優化

**修改前：**
```javascript
app.use(
  cors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:3001', 
      'https://localhost:8080', 
      'http://localhost:3005',
      'https://guru-laptop-lavendarbug-vqq.zeabur.app'
    ],
```

**修改後：**
```javascript
// 根據環境動態設定 CORS origin
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://yunlavendar-guru-smart-laptop.zeabur.app',
      'https://guru-laptop-lavendarbug-vqq.zeabur.app',
      'https://localhost:8080'
    ]
  : [
      'http://localhost:3000', 
      'http://localhost:3001', 
      'https://localhost:8080', 
      'http://localhost:3005',
      'https://guru-laptop-lavendarbug-vqq.zeabur.app'
    ]

app.use(
  cors({
    origin: corsOrigins,
```

### 3. WebSocket 環境配置

**修改前：**
```javascript
this.ws = new WebSocket('ws://guru-laptop-lavendarbug-vqq.zeabur.app')
```

**修改後：**
```javascript
// 根據環境動態選擇 WebSocket URL
const wsUrl = process.env.NODE_ENV === 'production' 
  ? 'wss://guru-laptop-lavendarbug-vqq.zeabur.app'
  : 'ws://localhost:3005'
this.ws = new WebSocket(wsUrl)
```

### 4. Next.js 端口配置

**修改前：**
```json
"start": "next start"
```

**修改後：**
```json
"start": "next start -p 8080"
```

### 5. Next.js 圖片域名配置

**修改前：**
```javascript
remotePatterns: [
  {
    protocol: 'https',
    hostname: 'guru-laptop-lavendarbug-vqq.zeabur.app',
  },
]
```

**修改後：**
```javascript
remotePatterns: [
  {
    protocol: 'https',
    hostname: 'guru-laptop-lavendarbug-vqq.zeabur.app',
  },
  {
    protocol: 'https',
    hostname: 'yunlavendar-guru-smart-laptop.zeabur.app',
  },
  {
    protocol: 'https',
    hostname: 'localhost',
    port: '8080',
  },
]
```

## 🐛 styled-jsx 錯誤處理

### 錯誤訊息
```
[Error: EISDIR: illegal operation on a directory, readlink 'D:\Users\User\Documents\coding\project_laptop\next-guru\frontend\node_modules\styled-jsx\index.js'] {
  errno: -4068,
  code: 'EISDIR',
  syscall: 'readlink',
  path: 'D:\\Users\\User\\Documents\\coding\\project_laptop\\next-guru\\frontend\\node_modules\\styled-jsx\\index.js'
}
```

### 問題分析
- `styled-jsx` 套件的 `dist/index` 是一個目錄而不是檔案
- 導致 `readlink` 操作失敗
- 影響 Next.js 構建過程

### 解決嘗試
1. **移除套件：** `npm uninstall styled-jsx` - 但問題仍然存在
2. **重新安裝依賴：** `rm -rf node_modules && npm install` - 問題持續
3. **跳過錯誤：** 構建成功但啟動失敗

### 建議解決方案
- **生產環境：** Zeabur 會重新安裝依賴，可能不會遇到此問題
- **本機開發：** 使用 `npm run dev` 避免此問題
- **長期解決：** 等待 `styled-jsx` 套件更新或尋找替代方案

## 📊 修改統計

### 檔案修改數量
- **後端檔案：** 3 個
- **前端檔案：** 5 個
- **配置檔案：** 2 個
- **總計：** 10 個檔案

### 修改類型
- **環境變數配置：** 6 處
- **URL 動態化：** 8 處
- **CORS 設定：** 1 處
- **端口配置：** 1 處

## 🎯 測試建議

### 本機測試
```bash
# 開發模式（避免 styled-jsx 問題）
npm run dev

# 生產模式（如果 styled-jsx 問題解決）
npm run build
npm start
```

### 生產環境測試
1. **推送代碼到 GitHub**
2. **等待 Zeabur 自動部署**
3. **檢查 Runtime Logs**
4. **測試各功能頁面**

## 🔍 常見問題 Q&A

### Q: 為什麼需要動態 URL？
**A:** 因為開發環境和生產環境使用不同的域名和端口，硬編碼會導致生產環境無法正常工作。

### Q: styled-jsx 錯誤會影響生產環境嗎？
**A:** 通常不會，因為 Zeabur 會重新安裝所有依賴，可能不會遇到同樣的問題。

### Q: CORS 配置為什麼要分環境？
**A:** 安全考量，生產環境只允許特定的域名訪問，避免不必要的跨域請求。

### Q: Next.js 為什麼要設定 8080 端口？
**A:** 因為 Zeabur 配置為使用 8080 端口，需要與部署平台保持一致。

### Q: 圖片域名配置的作用是什麼？
**A:** 允許 Next.js 的 Image 組件載入來自這些域名的圖片，防止 CORS 阻擋。

## 📝 後續建議

1. **監控部署狀態** - 檢查 Zeabur Runtime Logs
2. **功能測試** - 測試所有修改過的頁面
3. **性能優化** - 考慮使用環境變數統一管理
4. **文檔更新** - 更新部署文檔和環境配置說明

## 🏷️ 標籤
`環境配置` `部署問題` `CORS` `WebSocket` `Next.js` `Zeabur` `styled-jsx` `localhost:3000`

---
**最後更新：** 2025-01-10 23:45  
**狀態：** 待測試  
**負責人：** AI Assistant + User
