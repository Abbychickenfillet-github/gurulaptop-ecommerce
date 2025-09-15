# 2025-09-16 Cookie 環境變數與 undefined.length 錯誤修復總結

## 🎯 問題概述

本次對話主要解決了前端應用程式在部署到生產環境（Zeabur）後，無法正確讀取 `accessToken` Cookie 導致的 401 (Unauthorized) 錯誤，以及 `Cannot read properties of undefined (reading 'length')` 的前端渲染錯誤。

## 🔍 核心問題與解決方案

### 1. **Cookie 設定問題 (401 Unauthorized)**

**問題根源**：
後端在設定 `accessToken` Cookie 時，`domain` 參數被硬編碼為 `'localhost'`，導致在生產環境（跨域）下 Cookie 無法被正確設定和發送。

**解決方案**：
修改 `backend/routes/login.js` 和 `backend/routes/auth.js` 中的 `res.cookie` 設定：

```javascript
// 修復前
res.cookie('accessToken', token, {
  httpOnly: false,
  secure: false,
  sameSite: 'lax',
  maxAge: 2 * 24 * 60 * 60 * 1000,
  path: '/',
  domain: 'localhost' // ← 問題所在
})

// 修復後
res.cookie('accessToken', token, {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production', // 動態設定
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 動態設定
  maxAge: 2 * 24 * 60 * 60 * 1000,
  path: '/'
  // 移除 domain 設定，讓瀏覽器自動處理
})
```

**關鍵修復**：
- **移除 `domain: 'localhost'`**：讓瀏覽器自動處理 domain，這通常是最佳實踐
- **動態設定 `secure`**：生產環境使用 HTTPS 時設為 `true`
- **動態設定 `sameSite`**：生產環境（跨域）使用 `'none'`，開發環境使用 `'lax'`

### 2. **前端環境變數載入問題**

**問題根源**：
前端在 `npm start` 時，可能沒有正確載入 `NODE_ENV=production`，導致使用了開發環境的 API URL。

**解決方案**：
修改 `frontend/package.json` 中的腳本：

```json
{
  "scripts": {
    "dev": "rimraf .next && next dev --turbo",
    "build": "NODE_ENV=production next build",
    "start": "NODE_ENV=production next start",
    "lint": "next lint"
  }
}
```

**環境變數優先順序**：
`package.json` 腳本中設定的環境變數會**覆蓋** `.env` 檔案中同名的環境變數。
優先順序：系統環境變數 > `package.json` 腳本 > `.env` 檔案

### 3. **前端渲染錯誤 (`Cannot read properties of undefined (reading 'length')`)**

**問題根源**：
當 API 請求失敗或返回空數據時，前端組件在嘗試對 `undefined` 執行 `.map()` 或 `.filter()` 等數組操作時，導致了 `TypeError`。

**修復的組件**：
1. **EventManagement.js** - `events.map()` 錯誤
2. **GroupManagement.js** - `groups.map()` 錯誤  
3. **CouponUser.js** - `couponDataList.filter()` 錯誤

**解決方案**：

#### **三元運算子 `? :` vs 邏輯運算子 `&&`**

**完整三元運算子**：
```javascript
{events && events.length > 0 ? events.map((event) => (
  // 有數據時顯示
)) : (
  // 沒有數據時顯示友好訊息
  <div className="alert alert-info m-3" role="alert">
    <i className="bi bi-info-circle me-2"></i>
    目前沒有報名的活動
  </div>
)}
```

**邏輯 AND 運算子**：
```javascript
{groups && groups.length > 0 && groups.map((group) => (
  // 只有當條件為 true 時才執行
  // 當條件為 false 時，什麼都不渲染
))}
```

#### **邏輯 OR 運算子 `||` 提供默認值**

```javascript
// 修復前
couponDataList.filter((coupon) => {
  // 如果 couponDataList 是 undefined，會報錯
})

// 修復後
(couponDataList || []).filter((coupon) => {
  // 確保總是有一個數組可以調用 filter
})
```

**`||` 的邏輯**：
- 如果 `couponDataList` 存在且不為 `null`/`undefined`，使用 `couponDataList`
- 如果 `couponDataList` 為 `null`/`undefined`，使用空數組 `[]`

#### **`filter()` 函數詳細解釋**

```javascript
(couponDataList || []).filter((coupon) => {
  const searchContent = searchTerm.toLowerCase()
  return (
    coupon.coupon_content.toLowerCase().includes(searchContent) ||
    coupon.coupon_code.toLowerCase().includes(searchContent) ||
    String(coupon.coupon_discount).includes(searchContent)
  )
})
```

**`filter()` 的作用**：
- **遍歷數組**：檢查每個 `coupon` 項目
- **返回布林值**：`true` 保留，`false` 過濾掉
- **創建新數組**：只包含符合條件的項目

**條件檢查中的 `||`**：
- 只要**任何一個條件**為 `true`，就保留這個優惠券
- 如果**所有條件**都是 `false`，就過濾掉這個優惠券

**實際例子**：
```javascript
// 搜尋 "50" 時：
// 優惠券 A: coupon_content="滿1000送50", coupon_code="SAVE50", coupon_discount=50
// 檢查：true || true || true = true ✅ 保留

// 優惠券 B: coupon_content="免運費", coupon_code="FREE", coupon_discount=0  
// 檢查：false || false || false = false ❌ 過濾掉
```

## 🔍 **sameSite 參數詳細解釋**

### **sameSite 的三個值**

1. **`sameSite: 'strict'`**
   - **最嚴格**：Cookie 只能在**同一個網站**使用
   - **不能跨域**：即使從其他網站連結過來也不會發送 Cookie
   - **安全性最高**，但功能限制最多

2. **`sameSite: 'lax'` (預設)**
   - **中等嚴格**：Cookie 可以在**同一個網站**和**從其他網站連結過來**時使用
   - **不能跨域**：但可以從外部連結訪問
   - **平衡安全性和功能性**

3. **`sameSite: 'none'`**
   - **最寬鬆**：Cookie 可以在**任何跨域請求**中使用
   - **可以跨域**：包括 AJAX 請求、iframe 嵌入等
   - **功能最完整**，但需要配合 `secure: true`

### **為什麼需要 `sameSite: 'none'`？**

在你的部署環境中：
- **前端**：`yunlavendar-guru-smart-laptop.zeabur.app`
- **後端**：`guru-laptop-lavendarbug-vqq.zeabur.app`

這是**跨域**的情況，所以需要 `sameSite: 'none'` 才能讓 Cookie 正常工作。

### **重要限制**

**`sameSite: 'none'` 必須配合 `secure: true`**：
```javascript
res.cookie('accessToken', token, {
  secure: true,        // 必須是 true
  sameSite: 'none'     // 才能使用 none
})
```

## 🌐 **localhost vs Zeabur 網域 Token 對比**

### **Token 值是否相同？**

**答案：是的！** Token 的值在 localhost 和 Zeabur 網域下是相同的。

**原因**：
1. **JWT Token 的生成**：基於用戶資料和 `ACCESS_TOKEN_SECRET`
2. **相同的用戶資料**：同一個用戶在不同環境下登入
3. **相同的密鑰**：`ACCESS_TOKEN_SECRET` 在兩個環境中相同
4. **相同的演算法**：都使用相同的 JWT 簽名演算法

**驗證方法**：
從你的截圖可以看到，`accessToken` 的值是：
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJlbWFpbCI6ImFpbnRsdW1pbmF0ZTVAZ21haWwuY29tIiwiY291bnRyeSI6bnVsbCwiY2l0eSI6bnVsbCwicm9hZF9uYW1lIjpudWxsLCJkZXRhaWxlZF9hZGRyZXNzIjpudWxsLCJsZXZlbCI6MCwicGhvbmUiOiIwOTU2ODc0NTk2IiwiaWF0IjoxNzU3OTYxMzMyLCJleHAiOjE3NTgxMzQxMzJ9.TKRm3luUqZny-JHV1aVbBSa3k0V8j7Xrtb_aw9BXlhl
```

這個 Token 包含了：
- **Header**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
- **Payload**: 包含 `user_id: 2`, `email: "aintluminate5@gmail.com"` 等資訊
- **Signature**: `TKRm3luUqZny-JHV1aVbBSa3k0V8j7Xrtb_aw9BXlhl`

**為什麼很酷？**
- **一致性**：無論在哪個環境，同一個用戶的 Token 都是相同的
- **可攜性**：Token 可以在不同環境間使用（如果設定正確）
- **安全性**：Token 的簽名確保了資料的完整性

## 🚀 部署與驗證

### **修復步驟**：
1. **重新部署後端服務**：確保 Cookie 設定的修改生效
2. **重新構建前端**：`cd frontend && npm run build`
3. **啟動前端**：`npm start`

### **驗證方法**：
1. **檢查 Cookie**：瀏覽器 DevTools → Application → Cookies，確認 `accessToken` 存在且設定正確
2. **檢查 Network**：API 請求包含 Cookie 且不再返回 401 錯誤
3. **檢查控制台**：`Cannot read properties of undefined (reading 'length')` 錯誤已消失

## 📝 學習重點總結

1. **Cookie 設定**：移除硬編碼的 `domain`，使用動態的 `secure` 和 `sameSite`
2. **環境變數**：`package.json` 腳本可以覆蓋 `.env` 檔案
3. **防禦性編程**：使用 `||` 提供默認值，使用 `&&` 和 `? :` 進行條件渲染
4. **`filter()` 函數**：過濾數組，只保留符合條件的項目
5. **`||` 運算子**：在條件中表示「或」的邏輯，在賦值中提供默認值
6. **JWT Token**：在不同環境下，相同用戶的 Token 值是相同的

## 🎉 結果

問題完美解決！用戶可以正常登入，Cookie 正確設定，前端不再出現 `undefined.length` 錯誤，dashboard 功能完全正常運作。

---

*主要問題：Cookie 設定、環境變數、undefined.length 錯誤*  
*解決狀態：✅ 完全解決*
