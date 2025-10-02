// 測試前後端數據結構一致性
// 使用方法：node test-data-structure.js

// 模擬後端返回的數據結構 (只包含用戶資料，不包含認證狀態)
const backendResponse = {
  status: 'success',
  token: 'jwt-token-here',
  message: '登入成功',
  data: {
    user_id: 123,
    name: 'John Doe',
    phone: '0912345678',
    email: 'john@example.com',
    gender: 'male',
    birthdate: '1990-01-01',
    country: 'Taiwan',
    city: 'Taipei',
    district: 'Zhongzheng',
    road_name: 'Chungshan Road',
    detailed_address: 'No. 123',
    remarks: 'Test user',
    level: 1,
    google_uid: null,
    line_uid: null,
    photo_url: 'https://example.com/photo.jpg',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60)
  }
  // 注意：後端不返回 isAuth，這是前端的認證狀態
}

// 模擬前端期望的數據結構
const frontendExpected = {
  isAuth: true,
  userData: {
    user_id: 0,
    name: '',
    phone: '',
    email: '',
    gender: '',
    birthdate: '',
    country: '',
    city: '',
    district: '',
    road_name: '',
    detailed_address: '',
    remarks: '',
    level: 0,
    google_uid: null,
    line_uid: null,
    photo_url: '',
    iat: '',
    exp: ''
  },
  isLoading: false,
  hasChecked: true
}

// 檢查數據結構一致性
function checkDataStructure() {
  console.log('🔍 檢查前後端數據結構一致性...\n')

  // 比較的是後端的 data 和前端的 userData
  const backendFields = Object.keys(backendResponse.data)
  const frontendFields = Object.keys(frontendExpected.userData)

  console.log('📊 後端 data 欄位:', backendFields)
  console.log('📊 前端 userData 欄位:', frontendFields)

  console.log('\n💡 說明:')
  console.log('- 後端只返回用戶資料 (data)')
  console.log('- 前端添加認證狀態 (isAuth, isLoading, hasChecked)')
  console.log('- 比較的是 data 和 userData 的欄位一致性\n')

  // 檢查缺失的欄位
  const missingInFrontend = backendFields.filter(field => !frontendFields.includes(field))
  const missingInBackend = frontendFields.filter(field => !backendFields.includes(field))

  console.log('\n❌ 前端缺失的欄位:', missingInFrontend)
  console.log('❌ 後端缺失的欄位:', missingInBackend)

  // 檢查欄位類型
  console.log('\n🔍 檢查欄位類型一致性:')
  backendFields.forEach(field => {
    if (frontendFields.includes(field)) {
      const backendType = typeof backendResponse.data[field]
      const frontendType = typeof frontendExpected.userData[field]
      const isConsistent = backendType === frontendType
      console.log(`${field}: 後端(${backendType}) vs 前端(${frontendType}) ${isConsistent ? '✅' : '❌'}`)
    }
  })

  // 總結
  const isConsistent = missingInFrontend.length === 0 && missingInBackend.length === 0
  console.log(`\n${isConsistent ? '✅' : '❌'} 數據結構${isConsistent ? '一致' : '不一致'}!`)

  // 檢查類型不一致的欄位
  const typeInconsistentFields = []
  backendFields.forEach(field => {
    if (frontendFields.includes(field)) {
      const backendType = typeof backendResponse.data[field]
      const frontendType = typeof frontendExpected.userData[field]
      if (backendType !== frontendType) {
        typeInconsistentFields.push({
          field,
          backendType,
          frontendType,
          backendValue: backendResponse.data[field],
          frontendValue: frontendExpected.userData[field]
        })
      }
    }
  })

  if (typeInconsistentFields.length > 0) {
    console.log('\n⚠️ 類型不一致的欄位:')
    typeInconsistentFields.forEach(item => {
      console.log(`${item.field}: 後端(${item.backendType}) vs 前端(${item.frontendType})`)
      console.log(`  後端值: ${item.backendValue}`)
      console.log(`  前端值: ${item.frontendValue}`)
    })
  }

  return isConsistent
}

// 執行測試
checkDataStructure()

// 模擬不一致的情況
console.log('\n' + '='.repeat(50))
console.log('🧪 模擬數據不一致的情況:')
console.log('='.repeat(50))

// 情況1：後端多了一個欄位
const inconsistentBackend = {
  ...backendResponse,
  data: {
    ...backendResponse.data,
    new_field: 'new value' // 新增欄位
  }
}

// 情況2：前端期望的欄位後端沒有
const inconsistentFrontend = {
  ...frontendExpected,
  userData: {
    ...frontendExpected.userData,
    missing_field: 'expected value' // 期望但沒有的欄位
  }
}

console.log('情況1: 後端多了 new_field 欄位')
console.log('情況2: 前端期望 missing_field 欄位但後端沒有')

console.log('\n💡 這些不一致會導致:')
console.log('1. 前端無法獲取某些用戶資料')
console.log('2. 前端期望的欄位為 undefined')
console.log('3. 可能導致頁面渲染錯誤')
console.log('4. 用戶體驗受影響')
