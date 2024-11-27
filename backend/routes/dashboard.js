import express from 'express'
import bodyParser from 'body-parser'
import { generateHash, compareHash } from '../db-helpers/password-hash.js'
import multer from 'multer'
const router = express.Router()
const upload = multer()
// 不要直接用auth狀態,
import db from '##/configs/mysql.js'

// 這是dashboard的路由
// 老師說用get id之後去寫我不確定怎麼寫
router.get('/all', async function (req, res) {
  try {
    const [users] = await db.query('SELECT * FROM users')
    return res.json({ status: 'success', data: { users } })
  } catch (error) {
    console.error('無法取得資料:', error)
    return res.status(500).json({ status: 'error', message: '無法連接' })
  }
})

// 在 /api/dashboard/:user_id 的路由中,我們使用了 req.params 來獲取 URL 中的動態參數 user_id。然後,我們使用這個 user_id 來查詢資料庫,找到對應的使用者資訊。
router.get('/:user_id', async function (req, res) {
  try {
    const { user_id } = req.params //這邊params取的是自己寫的後端路由並非前端對吧
    const [users] = await db.query('SELECT * FROM users WHERE user_id = ?', [user_id])
    
    if (users.length === 0) {
      return res.status(404).json({ status: 'error', message: '找不到該用戶' })
    }

    return res.json({ status: 'success', data: { user: users[0] } })
  } catch (error) {
    console.error('無法取得資料:', error)
    return res.status(500).json({ status: 'error', message: '無法連接' })
  }
})
// patch這邊用於部分更新資源，只傳送需要更新的欄位，較為節省頻寬。用put會覆蓋整個資源，如果缺少某些欄位可能會被設為null,與我原本的語意不同所以使用patch。但經老師的解釋後是說Restful API 中規則 patch必須確定使用者更新的是哪一些欄位，否則會報錯，這樣操作比較麻煩，所以要用put

// 更新使用者資料，停用跟更新都是用同一個路由，更新照片應該也是同一個路由
router.put('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params
    const { name, gender, birthdate, phone, email, country, city, district, road_name, detailed_address, image_path, remarks ,valid} = req.body
    
      var [result] = await db.query(
        'UPDATE users SET name=?, birthdate=?, phone=?, gender=?, country=?, city=?, district=?, road_name=?, detailed_address=?, image_path=?, remarks=?, valid=? WHERE user_id=?',
        [
          name, birthdate, phone, gender,
          country, city, district, road_name, detailed_address, image_path, remarks, valid,
          user_id  // 加入 WHERE 條件的參數
        ]
      )

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: '找不到該用戶' })
    }
    // 這個IF是除錯用
    return res.json({ status: 'success', message: '更新成功' })
  } catch (error) {
    console.error('更新失敗:', error)
    return res.status(500).json({ status: 'error', message: '更新失敗' })
  }
})

// 變更密碼單獨抓出來一個區域做處理
router.put('/pwdCheck/:user_id', async (req, res) => {
  // console.log('收到請求參數:', req.params);
  // 在後端可以通過 req.params.user_id 取得這個值
  // console.log('收到請求內容:', req.body);  
    const { user_id } = req.params
    const { currentPassword } = req.body
    // console.log(currentPassword);
try{
    // 檢查當前密碼是否正確
    // console.log('檢查參數:', {
    //   user_id,
    //   currentPassword,
    //   currentPasswordType: typeof currentPassword,
    // })
    const [users] = await db.query(
      'SELECT password FROM users WHERE user_id = ?',
      [user_id]
    )
    if (users.length === 0) {
      return res.status(404).json({ status: 'error', message: '找不到該用戶' })
    }
    const hashedPassword = String(users[0].password)
    const inputPassword = String(currentPassword)

    const isMatch = await compareHash(inputPassword, hashedPassword)
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: 'error', message: '當前密碼不正確' })
    } else if (isMatch) {
      return res.status(200).json({
        status: 'pwdmatch',
        message: '用戶在輸入框中輸入之密碼與原始密碼吻合',
      })
      console.log('成功')
    }
  } catch (error) {
    console.error('檢查密碼失敗:', error)
    return res.status(500).json({ status: 'error', message: '伺服器錯誤' })
  }
})

router.put('/:user_id/pwdReset', async (req, res) => {
  try {
    const { user_id } = req.params
    const { newPassword1, newPassword2 } = req.body

    // 驗證參數
    if (!newPassword1|| !newPassword2) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要參數',
      })
    }
    // 如果上述新密碼 密碼1跟密碼2都一致的話，做以下的動作

    // 用新密碼2。產生新密碼的雜湊值
    const hashedPassword = await generateHash(newPassword2)

    // 更新密碼
    const [result] = await db.query(
      'UPDATE users SET password = ? WHERE user_id = ?',
      [hashedPassword, user_id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: '找不到該用戶',
      })
    }

    return res.status(200).json({
      status: 'resetPwd success',
      message: '新密碼更新成功，記得記住新密碼'
    });

  } catch (error) {
    console.error('密碼更新失敗:', error)
    return res.status(500).json({
      status: 'error',
      message: '密碼更新失敗',
    })
  }
})

export default router
