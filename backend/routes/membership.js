import express from 'express'
const router = express.Router()
import db from '##/configs/mysql.js'

// 獲取會員等級資訊
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params    
    // 查詢該會員的所有訂單總金額
    const [orders] = await db.query(
      'SELECT SUM(order_amount) as total_spent FROM order_list WHERE user_id = ?',
      [user_id]
    )
    
    const totalSpent = orders[0].total_spent || 0
    console.log(totalSpent);
    // 獲取會員基本資料
    const [userResults] = await db.query(
      'SELECT level FROM users WHERE user_id = ?',
      [user_id]
    )

    if (userResults.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    // 計算下一等級所需金額
    let nextLevelRequired = 0
    if (totalSpent < 20000){
      nextLevelRequired = 20000 - totalSpent
    } 
    else if (totalSpent < 40000) {nextLevelRequired = 40000 - totalSpent}
    else if (totalSpent < 70000) {nextLevelRequired = 70000 - totalSpent}
    else if (totalSpent < 100000) {nextLevelRequired = 100000 - totalSpent}
    

    const [userCreated] = await db.query(
      'SELECT created_at FROM users WHERE user_id = ?',
      [user_id]
    )
    // 計算距離三年的天數
    const createdDate = new Date(userCreated[0].created_at)
    // 已經取得created_at為什麼還要再.created_at這時 userCreated 是一個陣列，其中第一個元素是包含 created_at 屬性的物件，所以要用：userCreated[0].created_at  // 取得實際的日期值

    const threeYearsLater = new Date(createdDate)
    threeYearsLater.setFullYear(createdDate.getFullYear() + 3)
    const daysRemaining = Math.ceil((threeYearsLater - new Date()) / (1000 * 60 * 60 * 24))
    res.json({
      // currentLevel: userResults[0].level,
      totalSpent: totalSpent,
      nextLevelRequired: nextLevelRequired,
      created_at: userCreated[0].created_at,
      daysToThreeYears: daysRemaining
    })
  } catch (error) {
    console.error('Error fetching membership data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router