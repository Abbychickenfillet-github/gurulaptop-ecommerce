# React Key 屬性使用指南

## 問題背景

在 `frontend/components/layout/default-layout/header.js` 中發現使用 `item.path` 作為 React key：

```javascript
const navItems = [
  { name: '首頁', path: '/' },
  { name: '產品', path: '/product' },
  { name: '比較', path: '/product/compare' },
  { name: '活動', path: '/event' },
  { name: '揪團', path: '/group' },
  { name: '部落格', path: '/blog' },
]

// 使用 item.path 作為 key
{navItems.map((item) => (
  <Link
    key={item.path}  // ✅ 使用路徑作為 key
    href={item.path}
  >
    {item.name}
  </Link>
))}
```

**問題：** 原來 Key 也可以用 `item.path`？不是只有數字！

## React Key 屬性的要求

React 的 `key` 屬性需要滿足以下條件：

1. **唯一性**：在同一個父組件中，每個 key 必須是唯一的
2. **穩定性**：在組件重新渲染時，相同的元素應該有相同的 key
3. **可預測性**：key 應該在組件生命週期中保持不變

## Key 可以使用的數據類型

### 1. 數字（最常見）
```javascript
const items = [1, 2, 3, 4, 5]
return items.map(item => <div key={item}>{item}</div>)
```

### 2. 字符串
```javascript
const navItems = [
  { name: '首頁', path: '/' },
  { name: '產品', path: '/product' },
  { name: '比較', path: '/product/compare' }
]

return navItems.map(item => (
  <Link key={item.path} href={item.path}>
    {item.name}
  </Link>
))
```

### 3. 對象屬性
```javascript
const users = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' }
]

return users.map(user => (
  <div key={user.id}>{user.name}</div>
))
```

### 4. 組合值
```javascript
const posts = [
  { id: 1, category: 'tech', title: 'React Tips' },
  { id: 2, category: 'tech', title: 'Vue Guide' }
]

return posts.map(post => (
  <div key={`${post.category}-${post.id}`}>{post.title}</div>
))
```

## 為什麼 `item.path` 是好的 key 選擇？

在你的代碼中使用 `item.path` 作為 key 是非常好的選擇：

```javascript
const navItems = [
  { name: '首頁', path: '/' },
  { name: '產品', path: '/product' },
  { name: '比較', path: '/product/compare' },
  { name: '活動', path: '/event' },
  { name: '揪團', path: '/group' },
  { name: '部落格', path: '/blog' },
]

// 使用 item.path 作為 key
{navItems.map((item) => (
  <Link
    key={item.path}  // ✅ 使用路徑作為 key
    href={item.path}
  >
    {item.name}
  </Link>
))}
```

**優點：**

1. **唯一性**：每個導航項目的路徑都是唯一的
2. **穩定性**：路徑不會在組件生命週期中改變
3. **語義性**：key 與實際的 href 屬性一致，邏輯清晰
4. **可讀性**：代碼更容易理解和維護

## 其他常見的 key 使用場景

### 1. 用戶列表
```javascript
const users = [
  { id: 1, username: 'john_doe' },
  { id: 2, username: 'jane_smith' }
]

return users.map(user => (
  <div key={user.id}>{user.username}</div>
))
```

### 2. 商品列表
```javascript
const products = [
  { sku: 'PROD-001', name: 'iPhone' },
  { sku: 'PROD-002', name: 'Samsung' }
]

return products.map(product => (
  <div key={product.sku}>{product.name}</div>
))
```

### 3. 時間戳（不推薦，但可行）
```javascript
const messages = [
  { content: 'Hello', timestamp: 1640995200000 },
  { content: 'Hi', timestamp: 1640995260000 }
]

return messages.map(msg => (
  <div key={msg.timestamp}>{msg.content}</div>
))
```

### 4. UUID 或唯一標識符
```javascript
const tasks = [
  { uuid: '550e8400-e29b-41d4-a716-446655440000', title: 'Task 1' },
  { uuid: '550e8400-e29b-41d4-a716-446655440001', title: 'Task 2' }
]

return tasks.map(task => (
  <div key={task.uuid}>{task.title}</div>
))
```

## 避免使用的 key 類型

### ❌ 不要使用數組索引（除非沒有其他選擇）
```javascript
// 不推薦 - 當數組順序改變時會導致問題
return items.map((item, index) => (
  <div key={index}>{item.name}</div>
))

// 問題場景：
// 原始數組：[A, B, C] -> keys: [0, 1, 2]
// 刪除 B 後：[A, C] -> keys: [0, 1]
// React 會認為 C 變成了 B，導致不必要的重新渲染
```

### ❌ 不要使用隨機值
```javascript
// 不推薦 - 每次渲染都會產生新的 key
return items.map(item => (
  <div key={Math.random()}>{item.name}</div>
))

// 問題：每次重新渲染都會創建新的組件實例
```

### ❌ 不要使用會變化的值
```javascript
// 不推薦 - 如果 item.name 會改變
return items.map(item => (
  <div key={item.name}>{item.name}</div>
))

// 問題：如果用戶修改了 name，key 會改變，導致組件重新創建
```

## Key 的最佳實踐

### 1. 優先使用唯一且穩定的標識符
```javascript
// ✅ 好的做法
const users = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' }
]

return users.map(user => (
  <div key={user.id}>{user.name}</div>
))
```

### 2. 如果沒有唯一標識符，考慮創建一個
```javascript
// ✅ 好的做法 - 使用組合值
const items = [
  { category: 'tech', title: 'React Guide' },
  { category: 'tech', title: 'Vue Guide' }
]

return items.map((item, index) => (
  <div key={`${item.category}-${index}`}>{item.title}</div>
))
```

### 3. 在複雜組件中使用有意義的 key
```javascript
// ✅ 好的做法
const posts = [
  { id: 1, title: 'Post 1', comments: [...] },
  { id: 2, title: 'Post 2', comments: [...] }
]

return posts.map(post => (
  <div key={post.id}>
    <h2>{post.title}</h2>
    {post.comments.map(comment => (
      <div key={comment.id}>{comment.text}</div>
    ))}
  </div>
))
```

## 常見錯誤和解決方案

### 錯誤 1：忘記添加 key
```javascript
// ❌ 錯誤
return items.map(item => <div>{item.name}</div>)

// ✅ 正確
return items.map(item => <div key={item.id}>{item.name}</div>)
```

### 錯誤 2：使用不穩定的 key
```javascript
// ❌ 錯誤 - 如果 item.name 會改變
return items.map(item => <div key={item.name}>{item.name}</div>)

// ✅ 正確 - 使用穩定的 id
return items.map(item => <div key={item.id}>{item.name}</div>)
```

### 錯誤 3：重複的 key
```javascript
// ❌ 錯誤 - 重複的 key
const items = [
  { id: 1, name: 'Item 1' },
  { id: 1, name: 'Item 2' }  // 重複的 id
]

// ✅ 正確 - 確保唯一性
const items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
]
```

## 總結

React 的 `key` 屬性非常靈活，可以是：

- ✅ **數字**：`key={item.id}`
- ✅ **字符串**：`key={item.path}`
- ✅ **對象屬性**：`key={user.email}`
- ✅ **組合值**：`key={`${category}-${id}`}`

**關鍵原則：**
1. **唯一性**：在同一個父組件中必須唯一
2. **穩定性**：在組件生命週期中保持不變
3. **可預測性**：相同的元素應該有相同的 key

在你的導航組件中使用 `item.path` 作為 key 是一個很好的選擇，因為路徑是唯一且穩定的，符合 React key 的所有要求。

## 相關文件

- `frontend/components/layout/default-layout/header.js` - 使用 `item.path` 作為 key 的實際例子

---

*記錄時間：2024年12月19日*
*討論主題：React Key 屬性的靈活使用與最佳實踐*
