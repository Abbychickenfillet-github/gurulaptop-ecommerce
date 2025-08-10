import { Sequelize } from 'sequelize'
import 'dotenv/config.js'
import applyModels from '#db-helpers/sequelize/models-setup.js'

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  timezone: '+08:00',
  define: {
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
})

// 測試連線
try {
  await sequelize.authenticate()
  console.log('✅ Database connected')
} catch (err) {
  console.error('❌ Unable to connect to the database:', err)
}

await applyModels(sequelize)
await sequelize.sync({})
console.log('✅ All models synced')

export default sequelize
