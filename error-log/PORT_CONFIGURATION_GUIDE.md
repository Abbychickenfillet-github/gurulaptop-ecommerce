# 🚀 Port 配置指南 - Next-Guru 專案

## 📋 概述

本文件說明 Next-Guru 專案中前後端 Port 配置的完整流程，包括開發環境和生產環境的設定。

## 🔧 當前配置狀況

### 前端 (Frontend)
- **開發環境**: `npm run dev` → Next.js 預設 port 3000
- **生產環境**: `npm start` → port 8080 (在 package.json 中設定。8080是zeabur內網連線預設值 )

### 後端 (Backend)
- **開發環境**: `npm run dev` → port 3005 (從 .env.development 讀取)
- **生產環境**: `npm start` → port 3005 (預設值，因為 .env.production 未正確載入)

## ⚠️ 問題分析

### 1. Port 不一致問題
```
前端: localhost:8080 (生產) / localhost:3000 (開發)
後端: localhost:3005 (所有環境)
```

### 2. 環境變數載入問題
- `.env.production` 文件存在但未被正確載入
- 後端使用預設值 `3005` 而非環境變數中的 `8080`

## 🛠️ 解決方案

### 方案一：統一使用 8080 Port (推薦)

#### 1. 修改後端預設值
```javascript
// backend/bin/www.js
var port = normalizePort(process.env.PORT || '8080')  // 改為 8080
```

#### 2. 更新前端 API 配置
```javascript
// frontend/configs/index.js
export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
```

#### 3. 更新 CORS 設定
```javascript
// backend/app.js
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
      'http://localhost:8080',  // 新增
      'http://localhost:3005',
      'https://guru-laptop-lavendarbug-vqq.zeabur.app'
    ]
```

### 方案二：環境變數正確載入

#### 1. 確保 .env.production 存在
```bash
# backend/.env.production
PORT=8080
NODE_ENV=production
# ... 其他環境變數
```

#### 2. 檢查環境變數載入機制
```javascript
// backend/utils/tool.js
export const loadEnv = (fileExt = '') => {
  if (!fileExt) {
    const env = process.env.NODE_ENV || 'development'
    fileExt = env === 'production' ? '.production' : '.development'
  }
  
  const envPath = `.env${fileExt}`
  console.log(`🔧 載入環境變數文件: ${envPath}`)
  
  const result = dotenv.config({ path: envPath })
  
  if (result.error) {
    console.warn(`⚠️ 無法載入環境變數文件 ${envPath}:`, result.error.message)
    dotenv.config()  // 嘗試載入默認 .env
  } else {
    console.log(`✅ 成功載入環境變數文件: ${envPath}`)
  }
}
```

## 🚨 關於硬寫成 8080 的影響

### ✅ 優點
1. **一致性**: 前後端都使用 8080，避免混淆
2. **簡單**: 不需要複雜的環境變數配置
3. **穩定**: 不會因為環境變數載入問題而改變 port

### ⚠️ 潛在問題

#### 1. 開發環境衝突
```bash
# 如果同時運行前端和後端
前端: localhost:8080
後端: localhost:8080  # 衝突！
```

#### 2. 解決方案
```bash
# 開發時使用不同 port
前端開發: npm run dev (port 3000)
後端開發: npm run dev (port 8080)

# 生產環境
前端生產: npm start (port 8080)
後端生產: npm start (port 8080)  # 需要修改
```

## 🔄 建議的開發流程

### 開發環境
```bash
# Terminal 1: 前端開發
cd frontend
npm run dev  # localhost:3000

# Terminal 2: 後端開發  
cd backend
npm run dev  # localhost:8080 (或 3005)
```

### 生產環境
```bash
# Terminal 1: 前端生產
cd frontend
npm start  # localhost:8080

# Terminal 2: 後端生產
cd backend
npm start  # localhost:8080
```

## 📝 環境變數配置

### 開發環境 (.env.development)
```bash
PORT=8080
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 生產環境 (.env.production)
```bash
PORT=8080
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## 🎯 normalizePort 函數說明

### 函數作用
將各種格式的端口值轉換成 Node.js HTTP 伺服器可用的有效端口格式。

### 處理流程
1. **數字轉換**: `parseInt(val, 10)`
2. **有效性檢查**: 檢查是否為 `NaN`
3. **範圍檢查**: 檢查是否 ≥ 0
4. **返回結果**: 數字、原始值或 `false`

### 使用範例
```javascript
normalizePort("8080")  // 返回 8080 (number)
normalizePort(8080)    // 返回 8080 (number)
normalizePort("abc")   // 返回 "abc" (string)
normalizePort(-1)      // 返回 false (boolean)
```

## 🔧 實際修改步驟

### 1. 修改後端預設 port
```javascript
// backend/bin/www.js 第 28 行
var port = normalizePort(process.env.PORT || '8080')
```

### 2. 更新前端 API 配置
```javascript
// frontend/configs/index.js
export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
```

### 3. 更新 CORS 設定
```javascript
// backend/app.js
// 在 corsOrigins 陣列中加入 'http://localhost:8080'
```

### 4. 測試配置
```bash
# 測試後端
cd backend
npm start
# 應該顯示: 伺服器啟動成功 http://localhost:8080

# 測試前端
cd frontend  
npm start
# 應該顯示: Ready - started server on 0.0.0.0:8080
```

## 📊 配置對照表

| 環境 | 前端 Port | 後端 Port | API URL |
|------|-----------|-----------|---------|
| 開發 | 3000 | 8080 | http://localhost:8080 |
| 生產 | 8080 | 8080 | http://localhost:8080 |

## 🎉 總結

硬寫成 8080 是可行的，但需要注意：

1. **開發時**: 前端用 3000，後端用 8080
2. **生產時**: 前後端都用 8080
3. **CORS**: 確保包含所有需要的 origin
4. **環境變數**: 保持一致性

這樣的配置既簡單又穩定，避免了環境變數載入的複雜性。
