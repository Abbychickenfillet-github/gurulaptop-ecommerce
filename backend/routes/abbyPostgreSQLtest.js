import db from './db.js'

// 測試建立一筆資料（假設你有 User model）
await db.models.User.create({
  name: 'Abby',
  email: 'abby@example.com',
})
