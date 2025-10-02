// 測試 field 參數的來源
console.log('🔍 測試 field 參數的來源:\n')

// 模擬物件
const testObject = {
  user_id: 123,
  name: 'John',
  phone: '0912345678',
  email: 'john@example.com'
}

// 獲取所有鍵名
const keys = Object.keys(testObject)
console.log('📊 Object.keys() 結果:', keys)

// 使用 filter 方法
const filteredKeys = keys.filter(field => {
  console.log(`🔍 當前 field 值: "${field}"`)
  console.log(`🔍 field 的類型: ${typeof field}`)
  console.log(`🔍 對應的值: ${testObject[field]}`)
  console.log('---')

  // 只保留長度大於 4 的欄位
  return field.length > 4
})

console.log('✅ 過濾後的結果:', filteredKeys)

// 驗證 field 就是 key
console.log('\n🧪 驗證 field 就是 key:')
keys.forEach(field => {
  console.log(`field: "${field}" → 值: ${testObject[field]}`)
})
