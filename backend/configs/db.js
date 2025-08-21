import { Sequelize } from 'sequelize';
import 'dotenv/config.js';

const sequelize = new Sequelize(process.env.zeabur_connection_string, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false 
    }
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

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