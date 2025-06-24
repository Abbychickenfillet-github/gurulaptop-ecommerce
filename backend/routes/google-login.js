import express from 'express'
const router = express.Router()
import db from '##/configs/mysql.js'

// import sequelize from '#configs/db.js'
// const { User } = sequelize.models

import jsonwebtoken from 'jsonwebtoken'
// 存取`.env`設定檔案使用
import 'dotenv/config.js'

// 定義安全的私鑰字串
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
// 以下流程:
  // 1. 先查詢資料庫是否有同google_uid的資料
  // 2-1. 有存在 -> 執行登入工作
  // 2-2. 不存在 -> 建立一個新會員資料(無帳號與密碼)，只有google來的資料 -> 執行登入工作

  // 1. 先查詢資料庫是否有同google_uid的資料
  // const total = await User.count({
  //   where: {
  //     google_uid,
  //   },
  // })
  router.post('/first', async function (req, res) {
    const providerData = req.body
    console.log('收到的登入資料:', providerData)
  
    try {
      if(!providerData.uid||!providerData.email){
        return res.status(400).json({
          status:'error',
          message:'資料不完整'
        })
      }
      console.log("後端google-login");
      //資料表有沒有這個google_uid了，將得出的答案存進users陣列中。如果這個陣列長度>1會在else
      const [users] = await db.query(
        'SELECT * FROM users WHERE google_uid = ?',
        [providerData.uid]
      )
  
      let user_id
      if (users.length === 0) {
        // 新用戶，建立帳號
        const [result] = await db.query(
          `INSERT INTO users 
           (name, email, google_uid, photo_url, level, valid) 
           VALUES (?, ?, ?, ?, 0, 1)`,
          [
            providerData.displayName,
            providerData.email,
            providerData.uid,
            providerData.photoURL
          ]
        )
        user_id = result.insertId
      } else {
        // 舊用戶，更新資料
        user_id = users[0].user_id
        await db.query(
          `UPDATE users 
           SET google_uid=?, name=?, email=?, photo_url=? 
           WHERE user_id=?`,
          [
            providerData.uid,
            providerData.displayName,
            providerData.email,
            providerData.photoURL,
            user_id
          ]
        )
      }
      //加密中
      const token = jsonwebtoken.sign(
        {
          user_id,
          email: providerData.email,
          google_uid: providerData.uid
        },
        accessTokenSecret,
        { expiresIn: '2d' }
      )
  
      res.cookie('Google-accessToken', token, { httpOnly: true })
      
      res.json({
        status: 'success',
        data: {
          accessToken: token,
          user: {
            user_id,
            name: providerData.displayName,
            email: providerData.email,
            photo_url: providerData.photoURL
          }
        }
      })
  
    } catch (error) {
      console.error('登入錯誤:', error)
      res.status(500).json({
        status: 'error',
        message: '登入過程發生錯誤'
      })
    }
  })
  
  export default router