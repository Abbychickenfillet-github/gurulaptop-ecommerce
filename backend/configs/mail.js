// 導入dotenv 使用 .env 檔案中的設定值 process.env
import 'dotenv/config.js'
import nodemailer from 'nodemailer'
// let transport = null

// 定義所有email的寄送伺服器位置
const transport = {
  service:'gmail',
  port:587,
  secure:true,
  auth:{
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false  // 添加這個設定可以避免某些 SSL 問題
  }
}


// 呼叫transport函式
const transporter = nodemailer.createTransport(transport)

// 驗証連線設定
transporter.verify((error, success) => {
  if (error) {
    // 發生錯誤
    console.error(
      'WARN - 無法連線至SMTP伺服器 Unable to connect to the SMTP server.'
        .bgYellow
    )
  } else {
    // 代表成功
    console.log('INFO - SMTP伺服器已連線 SMTP server connected.'.bgGreen)
  }
})

export default transporter
