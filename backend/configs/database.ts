import {Sequelize} from "Sequelize';
import dotenv from "dotenv";

dotenv.config();
// 上面這一行是什麼意思
// dotenv.config() loads environment variables from a .env file into process.env

// 為什麼要有DB_URL!是TS中的非空斷言運算子
const sequelize = new Sequelize(process.env.DB._URL!,{
    dialect: "postgres",
    protocol: "postgres",
});

export default sequelize;