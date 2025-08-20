// db-init.js
// !! 注意: 此檔案並不是express執行時用，只用於初始化資料庫資料，指令為`npm run seed`

import 'dotenv/config.js'
import db from '##/configs/pgClient.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

// 讓console.log呈現檔案與行號，與字串訊息呈現顏色用
import { extendLog } from '#utils/tool.js'
import 'colors'
extendLog()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function initializeDatabase() {
  try {
    console.log('INFO - 開始初始化 PostgreSQL 資料庫...'.bgCyan)

    // 1. 執行建表語法 (users 資料表)
    // 請將你的 users.sql 檔案放在專案根目錄下
    const usersTableSql = `
      -- PostgreSQL users table schema
      CREATE TABLE IF NOT EXISTS users (
          user_id SERIAL PRIMARY KEY, -- 使用 SERIAL 自動遞增，取代 INTEGER
          level SMALLINT NOT NULL DEFAULT 0,
          password VARCHAR(80), -- 密碼可能為空，因為 Line/Google 登入沒有密碼
          name VARCHAR(30),
          phone VARCHAR(30),
          email VARCHAR(30) UNIQUE NOT NULL, -- email 應該是唯一的
          valid BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP NOT NULL,
          gender VARCHAR(10),
          country VARCHAR(30),
          city VARCHAR(30),
          district VARCHAR(30),
          road_name VARCHAR(30),
          detailed_address VARCHAR(30),
          image_path TEXT,
          remarks VARCHAR(150),
          birthdate DATE,
          google_uid VARCHAR(255), -- Google UID 可能是長字串
          line_uid VARCHAR(255),  -- Line UID 可能是長字串
          line_access_token TEXT, -- Line Access Token 是長字串
          iat VARCHAR(50),
          exp VARCHAR(50)
      );
    `

    console.log('INFO - 正在建立或更新 users 資料表...')
    await db.query(usersTableSql)
    console.log('INFO - users 資料表建立完成！'.green)

    // 2. 執行種子資料 (seeds)
    console.log('INFO - 正在匯入種子資料...')
    const seedSql = `
      -- 範例種子資料 (你可以將你的資料寫在這裡，或從 JSON 檔案讀取)
      INSERT INTO users (
        name, email, created_at, password
      ) VALUES (
        '測試會員', 'test@example.com', CURRENT_TIMESTAMP, 'password_hash_here'
      ) ON CONFLICT (email) DO NOTHING; -- 避免重複插入
    `
    await db.query(seedSql)
    console.log('INFO - 種子資料匯入完成！'.green)

    // 如果你有其他資料表，請在這裡繼續執行 CREATE TABLE 語法...
    // 例如：
    // const otherTableSql = fs.readFileSync(path.join(__dirname, 'other_table.sql'), 'utf-8');
    // await db.query(otherTableSql);

    console.log(
      'INFO - 所有資料表與種子資料已完成同步化。 All seeds were synchronized successfully.'
        .bgGreen
    )
  } catch (error) {
    console.error('ERROR - 資料庫初始化失敗：'.bgRed)
    console.error(error)
  } finally {
    // 結束資料庫連線池
    await db.end()
    process.exit(0)
  }
}

// 執行初始化函式
initializeDatabase()
