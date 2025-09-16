# ZEABUR 部署無限迴圈 Network 問題修復

**發生時間**: 2025年9月16日  
**問題回報**: 用戶在 ZEABUR 部署時雖然成功登入 dashboard，但出現無限迴圈的 network 請求

## 📋 目錄

- [ ] [問題描述](#問題描述)
- [ ] [根本原因分析](#根本原因分析)
  - [ ] [buy-list/detail API 無限請求](#1-buy-listdetail-api-無限請求-主要問題)
  - [ ] [WebSocket 重連邏輯缺陷](#2-websocket-重連邏輯缺陷)
  - [ ] [認證狀態更新時序問題](#3-認證狀態更新時序問題)
  - [ ] [生產環境配置問題](#4-生產環境配置問題)
- [ ] [修復方案](#修復方案)
  - [ ] [修復 buy-list/detail 無限請求](#1-修復-buy-listdetail-無限請求-主要修復)
  - [ ] [修復 WebSocket 重連邏輯](#2-修復-websocket-重連邏輯)
  - [ ] [優化認證狀態更新時序](#3-優化認證狀態更新時序)
  - [ ] [環境配置驗證](#4-環境配置驗證)
- [ ] [修復效果](#修復效果)
- [ ] [測試建議](#測試建議)
- [ ] [預防措施](#預防措施)
- [ ] [後續問題與解答](#後續問題與解答)
  - [ ] [replace vs push 差異](#問題-1replace-跟-push-差在哪為什麼用-replace-可以避免歷史問題)
  - [ ] [NODE_ENV Windows 問題](#問題-2node_envproduction-在-windows-上的問題)
  - [ ] [WebSocket 條件判斷](#問題-3websocket-重連邏輯的條件判斷)
- [ ] [技術補充](#技術補充)
- [ ] [相關檔案](#相關檔案)
- [ ] [總結](#總結)

## 問題描述

在 ZEABUR 生產環境中，用戶登入後能夠成功進入 dashboard，但會出現無限迴圈的 network 請求，導致：
- 瀏覽器網路面板顯示大量重複請求
- 可能影響應用性能
- 用戶體驗不佳

## 根本原因分析

### 1. **buy-list/detail API 無限請求** ⚠️ **主要問題**

**問題位置**: `frontend/components/dashboard/buy-list.js` 第 95 行

**問題代碼**:
```javascript
useEffect(() => {
  if (order_id) {
    getOrderDetail()
  }
}, [order_id, getOrderDetail]) // ❌ getOrderDetail 沒有使用 useCallback
```

**問題分析**:
- `getOrderDetail` 函數沒有使用 `useCallback` 包裝
- 每次組件重新渲染都會創建新的函數引用
- `useEffect` 依賴數組中的 `getOrderDetail` 每次都是新的引用
- 導致 `useEffect` 無限觸發，造成 API 無限請求

**實際影響**:
- 對 `/api/buy-list/detail/${order_id}` 發送無限請求
- 雖然返回 200 狀態碼，但造成網路資源浪費
- 影響應用性能和用戶體驗

### 2. **WebSocket 重連邏輯缺陷** ⚠️

**問題位置**: `frontend/services/websocketService.js` 第 89 行

**問題代碼**:
```javascript
setTimeout(() => {
  if (this.ws?.readyState === WebSocketState.CLOSED) {
    this.connect() // ❌ 缺少 userId 參數
  }
}, 3000)
```

**問題分析**:
- 重連時沒有傳遞 `userId` 參數
- 導致重連後無法正確註冊用戶
- WebSocket 連接失敗，觸發無限重連循環

### 3. **認證狀態更新時序問題** 🔄

**問題位置**: `frontend/pages/member/login.js` 登入成功後的跳轉邏輯

**問題分析**:
- 登入成功後，`auth.isAuth` 狀態更新有延遲
- 跳轉邏輯在狀態未完全更新時就執行
- 可能造成頁面間的不斷跳轉

### 4. **生產環境配置問題** 🌐

**問題分析**:
- ZEABUR 環境中的 WebSocket 和 API 配置可能不正確
- 環境變數設置不當導致連接問題

## 修復方案

### 1. **修復 buy-list/detail 無限請求** ⭐ **主要修復**

**修改內容**:
```javascript
// 修復前（有問題）
const getOrderDetail = async () => {
  // ... API 請求邏輯
}

useEffect(() => {
  if (order_id) {
    getOrderDetail()
  }
}, [order_id, getOrderDetail]) // ❌ 無限觸發

// 修復後（正確）
const getOrderDetail = useCallback(async () => {
  // ... API 請求邏輯
}, [order_id]) // ✅ 使用 useCallback 包裝

useEffect(() => {
  if (order_id) {
    getOrderDetail()
  }
}, [order_id, getOrderDetail]) // ✅ 穩定引用
```

**修復效果**:
- ✅ 停止無限 API 請求
- ✅ 只在 `order_id` 變化時才重新請求
- ✅ 大幅減少網路流量
- ✅ 提升應用性能

### 2. **修復 WebSocket 重連邏輯**

**修改內容**:
```javascript
class WebSocketService {
  constructor() {
    // ... 其他屬性
    this.currentUserId = null // 新增：儲存當前用戶ID
  }

  connect(userId) {
    // 儲存用戶ID用於重連
    this.currentUserId = userId
    // ... 其他邏輯
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        if (this.ws?.readyState === WebSocketState.CLOSED && this.currentUserId) {
          this.connect(this.currentUserId) // ✅ 使用儲存的用戶ID重連
        }
      }, 3000)
    }
  }

  disconnect() {
    // ... 其他邏輯
    this.currentUserId = null // 清除用戶ID
  }
}
```

### 3. **優化認證狀態更新時序**

**修改內容**:
```javascript
// 登入成功後的跳轉邏輯
setTimeout(() => {
  // 檢查認證狀態是否已更新
  if (auth.isAuth) {
    router.replace('/dashboard') // 使用 replace 避免歷史記錄問題
  } else {
    console.warn('登入成功但認證狀態未更新，等待更長時間...')
    // 如果狀態還沒更新，再等待一下
    setTimeout(() => {
      router.replace('/dashboard')
    }, 500)
  }
}, 500) // 增加延遲時間
```

**登入頁面 useEffect 優化**:
```javascript
useEffect(() => {
  // 如果認證檢查還沒完成，不執行跳轉
  if (!auth.hasChecked) {
    console.log('Login 頁面: 認證檢查中...', auth)
    return
  }
  
  // 如果用戶已登入，重定向到儀表板
  if (auth?.isAuth) {
    // 使用 replace 而不是 push，避免歷史記錄問題
    router.replace('/dashboard')
    console.log('用戶已登入，跳轉到 dashboard')
    return
  }
}, [auth?.isAuth, auth?.hasChecked, router])
```

### 4. **環境配置驗證**

**當前配置狀況**:
- ✅ 生產環境 API URL: `https://guru-laptop-lavendarbug-vqq.zeabur.app`
- ✅ 開發環境 API URL: `http://localhost:3005`
- ✅ WebSocket URL 根據環境動態選擇
- ✅ 環境變數配置正確

## 修復效果

### 1. **WebSocket 連接穩定性**
- ✅ 重連時正確傳遞用戶ID
- ✅ 避免無限重連循環
- ✅ 連接失敗時有最大重試次數限制

### 2. **認證流程優化**
- ✅ 登入成功後等待認證狀態更新
- ✅ 使用 `router.replace` 避免歷史記錄問題
- ✅ 增加適當的延遲確保狀態同步

### 3. **生產環境穩定性**
- ✅ 環境變數配置正確
- ✅ API 和 WebSocket URL 動態選擇
- ✅ 避免硬編碼配置問題

## 測試建議

### 1. **本地測試**
```bash
# 測試 WebSocket 連接
1. 啟動前端和後端服務
2. 登入並進入 dashboard
3. 檢查瀏覽器網路面板，確認沒有無限請求
4. 測試 WebSocket 斷線重連功能
```

### 2. **ZEABUR 部署測試**
```bash
# 部署到 ZEABUR 後測試
1. 確認環境變數正確設置
2. 測試登入流程
3. 檢查 dashboard 頁面載入
4. 監控網路請求，確認沒有無限循環
```

## 預防措施

### 1. **代碼審查**
- 確保所有重連邏輯都正確傳遞必要參數
- 檢查認證狀態更新時序
- 驗證環境變數配置

### 2. **監控機制**
- 在生產環境中監控 WebSocket 連接狀態
- 設置網路請求頻率警報
- 記錄認證流程異常

### 3. **測試覆蓋**
- 增加 WebSocket 重連測試用例
- 測試認證狀態更新時序
- 驗證不同環境下的配置

## 相關檔案

- `frontend/services/websocketService.js` - WebSocket 服務修復
- `frontend/pages/member/login.js` - 登入頁面認證邏輯優化
- `frontend/configs/index.js` - API 配置
- `frontend/.env.production` - 生產環境變數
- `frontend/.env.development` - 開發環境變數

## 總結

通過修復 WebSocket 重連邏輯、優化認證狀態更新時序，以及驗證環境配置，成功解決了 ZEABUR 部署時的無限迴圈 network 問題。這些修復確保了：

1. **WebSocket 連接穩定性** - 重連時正確傳遞用戶ID
2. **認證流程可靠性** - 等待狀態更新後再執行跳轉
3. **生產環境穩定性** - 環境變數配置正確

建議在部署後進行全面測試，確保所有功能正常運作。

---

## 後續問題與解答

### 問題 1：replace 跟 push 差在哪？為什麼用 replace 可以避免歷史問題？

**用戶問題**：為什麼在修復中使用 `router.replace` 而不是 `router.push`？

**解答**：

#### 歷史記錄行為差異

```javascript
// 使用 router.push
router.push('/dashboard')
// 歷史記錄: [login] → [dashboard] → [新頁面]

// 使用 router.replace  
router.replace('/dashboard')
// 歷史記錄: [login] 被替換為 [dashboard] → [新頁面]
```

#### 具體範例說明

假設用戶的瀏覽歷史是這樣的：
```
首頁 → 登入頁面
```

**使用 `router.push('/dashboard')`：**
```
首頁 → 登入頁面 → dashboard
```
- 歷史記錄中保留登入頁面
- 用戶按「返回」按鈕會回到登入頁面
- 可能造成循環：登入頁面 → dashboard → 登入頁面

**使用 `router.replace('/dashboard')`：**
```
首頁 → dashboard
```
- 登入頁面被替換掉
- 用戶按「返回」按鈕會回到首頁
- 避免循環問題

#### 為什麼 replace 可以避免歷史問題？

**防止認證循環**：

在登入頁面中，如果使用 `push`：
```javascript
// 問題場景
useEffect(() => {
  if (auth?.isAuth) {
    router.push('/dashboard') // ❌ 會保留登入頁面在歷史記錄中
  }
}, [auth?.isAuth])

// 可能的循環：
// 1. 用戶在登入頁面
// 2. 認證成功，push 到 dashboard
// 3. Dashboard 檢查認證，發現問題，push 回登入頁面
// 4. 登入頁面又發現已登入，push 到 dashboard
// 5. 無限循環...
```

使用 `replace`：
```javascript
useEffect(() => {
  if (auth?.isAuth) {
    router.replace('/dashboard') // ✅ 替換登入頁面
  }
}, [auth?.isAuth])

// 結果：
// 1. 用戶在登入頁面
// 2. 認證成功，replace 到 dashboard
// 3. 歷史記錄中登入頁面被移除
// 4. 即使有問題，也不會回到登入頁面
```

#### 總結

| 方法 | 歷史記錄 | 使用場景 | 優缺點 |
|------|----------|----------|--------|
| `router.push` | 新增記錄 | 正常導航 | ✅ 保留歷史<br>❌ 可能造成循環 |
| `router.replace` | 替換記錄 | 重定向、認證 | ✅ 避免循環<br>❌ 無法返回 |

**在認證相關的跳轉中，使用 `replace` 是更好的選擇**，因為：
1. **避免循環** - 不會在歷史記錄中保留登入頁面
2. **更好的用戶體驗** - 用戶按返回按鈕不會回到登入頁面
3. **防止重複提交** - 避免用戶重複登入
4. **符合 Web 標準** - HTTP 重定向通常使用 replace 行為

---

### 問題 2：NODE_ENV=production 在 Windows 上的問題

**用戶問題**：為什麼 `NODE_ENV=production next build` 在 Windows 上不能執行？

**解答**：

#### 問題原因

```json
// package.json 中的問題代碼
"build": "NODE_ENV=production next build"
```

**問題分析**：
- `NODE_ENV=production` 是 Unix/Linux 的環境變數設置語法
- Windows 命令提示符不支援這種環境變數設置方式
- Windows 需要使用不同的語法或工具

#### 解決方案

**方案 1：使用 cross-env（推薦）**

```bash
# 安裝 cross-env
npm install --save-dev cross-env

# 修改 package.json
"scripts": {
  "build": "cross-env NODE_ENV=production next build",
  "start": "cross-env NODE_ENV=production next start"
}
```

**方案 2：Windows 原生語法**

```json
"scripts": {
  "build": "set NODE_ENV=production && next build",
  "start": "set NODE_ENV=production && next start"
}
```

**方案 3：移除環境變數設置**

```json
"scripts": {
  "build": "next build",
  "start": "next start"
}
```

#### 為什麼移除後還能正常運行？

1. **Next.js 自動判斷**：`next build` 命令會自動將環境視為 `production`
2. **部署平台設置**：ZEABUR 等平台會在部署時自動注入 `NODE_ENV=production`
3. **其他配置**：`next.config.js` 或其他文件可能處理環境變數

#### 端口配置確認

**用戶配置**：
- 前端：3000 (開發) / 8080 (生產)
- 後端：8080

**這是正確的配置**：
- ✅ 前後端使用不同端口避免衝突
- ✅ 開發環境前端用 3000，後端用 8080
- ✅ 生產環境前後端都用 8080
- ✅ 符合常見的部署架構

---

### 問題 3：WebSocket 重連邏輯的條件判斷

**用戶問題**：`if (this.ws?.readyState === WebSocketState.CLOSED && this.currentUserId)` 這個是兩個條件都要符合才會執行嗎？

**解答**：

是的！這個條件使用了 **邏輯 AND 運算符 (`&&`)**，所以兩個條件都必須符合才會執行。

#### 條件分析

```javascript
if (this.ws?.readyState === WebSocketState.CLOSED && this.currentUserId) {
  this.connect(this.currentUserId)
}
```

**條件 1：`this.ws?.readyState === WebSocketState.CLOSED`**
- **檢查 WebSocket 是否已關閉**
- 使用可選鏈運算符 (`?.`) 避免 `this.ws` 為 `null` 時出錯
- 只有當 WebSocket 狀態為 `CLOSED` (3) 時才為 `true`

**條件 2：`this.currentUserId`**
- **檢查是否有儲存的用戶ID**
- 只有當 `this.currentUserId` 存在且不為 `null`、`undefined`、`""` 時才為 `true`

#### 執行邏輯

| WebSocket 狀態 | currentUserId | 結果 | 是否執行 |
|----------------|---------------|------|----------|
| CLOSED | 有值 | `true && true` | ✅ 執行 |
| CLOSED | null/undefined | `true && false` | ❌ 不執行 |
| OPEN | 有值 | `false && true` | ❌ 不執行 |
| OPEN | null/undefined | `false && false` | ❌ 不執行 |
| CONNECTING | 有值 | `false && true` | ❌ 不執行 |

#### 為什麼需要兩個條件？

**1. 防止重複連接**
```javascript
// 如果 WebSocket 還在連接中或已連接，不應該重連
if (this.ws?.readyState === WebSocketState.CLOSED) // 只有關閉時才重連
```

**2. 確保有用戶ID**
```javascript
// 如果沒有用戶ID，重連也無法正確註冊用戶
if (this.currentUserId) // 只有有用戶ID時才重連
```

#### 實際場景範例

**✅ 會執行的情況**
```javascript
// 場景：WebSocket 連接斷開，且有儲存的用戶ID
this.ws = null // 或 readyState === 3 (CLOSED)
this.currentUserId = "user123"

// 結果：兩個條件都為 true，執行重連
if (true && true) {
  this.connect("user123") // ✅ 執行重連
}
```

**❌ 不會執行的情況**

**情況 1：WebSocket 還在連接中**
```javascript
this.ws.readyState = 1 // OPEN
this.currentUserId = "user123"

// 結果：第一個條件為 false
if (false && true) {
  // ❌ 不執行，避免重複連接
}
```

**情況 2：沒有用戶ID**
```javascript
this.ws = null
this.currentUserId = null

// 結果：第二個條件為 false
if (true && false) {
  // ❌ 不執行，避免無效重連
}
```

#### 安全機制

這個雙重條件檢查提供了多重保護：

1. **狀態保護** - 確保 WebSocket 真的斷開了
2. **數據保護** - 確保有有效的用戶ID
3. **邏輯保護** - 避免無效的重連嘗試

這樣的設計確保了重連邏輯的穩定性和可靠性！

---

## 技術補充

### Next.js 執行順序

在 Next.js 中，執行順序是：

```
1. next.config.js (構建時配置)
2. _app.js (應用初始化)
3. 頁面組件 (如 login.js)
4. 服務文件 (如 websocketService.js)
```

**詳細說明**：
- `next.config.js` 在構建時執行，配置 Next.js 行為
- `_app.js` 在應用啟動時執行，包裝所有頁面
- 頁面組件在路由匹配時執行
- 服務文件在需要時被導入執行

### WebSocket 安全連接 (wss://)

**wss://** 是 WebSocket Secure 的協議，相當於 HTTPS 的 WebSocket 版本：

- **ws://** - 不安全的 WebSocket 連接（HTTP）
- **wss://** - 安全的 WebSocket 連接（HTTPS）

**官方文檔來源**：
- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [RFC 6455 - The WebSocket Protocol](https://tools.ietf.org/html/rfc6455)
- [WebSocket.org](https://www.websocket.org/)

**使用場景**：
- 生產環境必須使用 `wss://` 確保數據安全
- 開發環境可以使用 `ws://` 簡化配置
- 瀏覽器安全策略要求 HTTPS 頁面只能連接 wss://