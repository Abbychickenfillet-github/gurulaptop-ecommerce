import * as fs from 'fs'
import path from 'path'
// 取得專案根目錄
import appRootPath from 'app-root-path'

// 修正 __dirname for esm, windows dynamic import bug
import { fileURLToPath, pathToFileURL } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
/**
 * 載入並套用所有定義在 'models' 資料夾中的 Sequelize 模型。
 * @param {object} sequelize - Sequelize 實例。
 */
export default async function applyModels(sequelize) {
  // 載入models中的各檔案
  const modelsPath = path.join(appRootPath.path, 'models')
  const filenames = await fs.promises.readdir(modelsPath)

  // 遍歷所有檔案，將它們作為 Sequelize 模型載入
  for (const filename of filenames) {
    // 組合出檔案的完整路徑 URL，並動態匯入該檔案
    const item = await import(pathToFileURL(path.join(modelsPath, filename)))
    // 執行每個模型檔案的預設匯出函式，將 Sequelize 實例傳入以定義模型
    item.default(sequelize)
  }
}
