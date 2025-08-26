import { Sequelize } from 'sequelize';
// 移除這裡的 dotenv 載入，讓 app.js 統一處理
// import 'dotenv/config.js';

// 調試：檢查環境變數
console.log('🔍 db.js 環境變數檢查:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('DB_HOST:', process.env.DB_HOST)
console.log('DB_PORT:', process.env.DB_PORT)
console.log('DB_NAME:', process.env.DB_NAME)
console.log('DB_USER:', process.env.DB_USER)
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ 已設置' : '❌ 未設置')
console.log('ZEABUR_CONNECTION_STRING:', process.env.ZEABUR_CONNECTION_STRING ? '✅ 已設置' : '❌ 未設置')

// 根据环境选择数据库连接
let connectionConfig;

if (process.env.NODE_ENV === 'production') {
  // 生产环境：使用环境变量或 Zeabur 连接
  connectionConfig = {
    connectionString: process.env.ZEABUR_CONNECTION_STRING || process.env.DATABASE_URL,
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false 
      }
    }
  };
  console.log('🚀 使用生產環境配置')
} else {
  // 开发环境：使用本地数据库
  connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'project_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your_password',
    dialect: 'postgres',
    protocol: 'postgres'
  };
  console.log('🛠️ 使用開發環境配置')
}

const sequelize = new Sequelize(connectionConfig);

// 測試連接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize PostgreSQL 連接成功');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

// 立即測試連接
testConnection();

export default sequelize;