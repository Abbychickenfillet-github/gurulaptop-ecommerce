# 🔐 認證問題修復：credentials: 'include' 的重要性

**發生時間**: 2025年1月2日  
**問題回報**: 用戶詢問 "Authorization failed, no access token" 錯誤

## 問題描述

在購物車頁面的優惠券功能中，出現「授權失敗，沒有存取令牌」錯誤，即使前端認證狀態顯示 `isAuth: true` 和 `user_id: 6`。

## 問題原因

### 前端認證狀態 vs API 請求認證

```javascript
// ✅ 前端認證狀態正常
const { auth } = useAuth()
console.log(auth.isAuth)  // true
console.log(auth.userData.user_id)  // 6

// ❌ 但 API 請求沒有包含 cookies
const res = await fetch(`/api/coupon-user/${userId}`)
// 缺少 credentials: 'include'
```

### 缺少 `credentials: 'include'` 的影響

1. **瀏覽器不會自動發送 cookies**
2. **後端收不到 `accessToken` cookie**
3. **認證中介軟體回傳「授權失敗」**

## 解決方案

### 修復前
```javascript
const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupon-user/${userId}`,
)
```

### 修復後
```javascript
const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupon-user/${userId}`,
  {
    method: 'GET',
    credentials: 'include',  // 🔑 關鍵修復
    headers: {
      'Content-Type': 'application/json',
    },
  }
)
```

## Cookie 認證流程

### 1. 登入流程
```
用戶登入 → 後端驗證 → 生成 JWT → 設置 accessToken cookie → 瀏覽器儲存
```

### 2. API 請求流程
```
前端發起請求 → 瀏覽器檢查 credentials: 'include' → 自動發送 cookies → 後端驗證 token
```

### 3. Cookie 來源說明

- **Cookies 來自瀏覽器**（前端），不是 `process.env`
- **登入時**：後端設置 cookie 到瀏覽器
- **API 請求時**：瀏覽器自動發送 cookie（需要 `credentials: 'include'`）

## 重要概念

### 前端認證狀態 ≠ API 請求認證

- **前端認證狀態**：`useAuth()` 提供的 `isAuth` 狀態
- **API 請求認證**：每次請求都需要發送 token（通過 cookies）

### 為什麼需要 `credentials: 'include'`？

- **跨域請求預設不發送 cookies**
- **`credentials: 'include'`** 告訴瀏覽器包含 cookies
- **沒有這個設定**，後端收不到認證 token

## 修復檔案

- `frontend/components/coupon/coupon-btn.js`
- 兩個 `getCouponData` 函數都需要添加 `credentials: 'include'`

## 測試結果

✅ **修復後**：
- 優惠券 API 請求成功
- 不再出現「授權失敗」錯誤
- 購物車功能正常運作

---

**修復日期**：2024-12-19  
**問題類型**：認證配置錯誤  
**影響範圍**：購物車優惠券功能
