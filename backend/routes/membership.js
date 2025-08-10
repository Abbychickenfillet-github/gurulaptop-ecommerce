import express from 'express'
const router = express.Router()
import db from '##/configs/pgClient.js'



// 獲取會員等級資訊
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params

    // 查詢該會員的所有訂單總金額
    const { rows: orders } = await db.query(
      'SELECT COALESCE(SUM(order_amount), 0) AS total_spent FROM order_list WHERE user_id = $1',
      [user_id]
    )

    const totalSpent = orders[0].total_spent
    console.log(totalSpent)

    // 獲取會員基本資料
    const { rows: userResults } = await db.query(
      'SELECT level FROM users WHERE user_id = $1',
      [user_id]
    )

    if (userResults.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    // 計算下一等級所需金額
    let nextLevelRequired = 0
    if (totalSpent < 20000) {
      nextLevelRequired = 20000 - totalSpent
    } else if (totalSpent < 40000) {
      nextLevelRequired = 40000 - totalSpent
    } else if (totalSpent < 70000) {
      nextLevelRequired = 70000 - totalSpent
    } else if (totalSpent < 100000) {
      nextLevelRequired = 100000 - totalSpent
    }

    // 查詢會員註冊日期
    const { rows: userCreated } = await db.query(
      'SELECT created_at FROM users WHERE user_id = $1',
      [user_id]
    )

    const createdDate = new Date(userCreated[0].created_at)
    const threeYearsLater = new Date(createdDate)
    threeYearsLater.setFullYear(createdDate.getFullYear() + 3)
    const daysRemaining = Math.ceil((threeYearsLater - new Date()) / (1000 * 60 * 60 * 24))

    res.json({
      totalSpent,
      nextLevelRequired,
      created_at: userCreated[0].created_at,
      daysToThreeYears: daysRemaining
    })
  } catch (error) {
    console.error('Error fetching membership data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router