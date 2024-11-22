import express from 'express'
import db from '../configs/mysql.js'
import { checkAuth } from './auth.js'

const router = express.Router()

// 獲取所有唯一的遊戲類型
router.get('/filters/types', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT event_type 
      FROM event_type 
      WHERE valid = 1 
      ORDER BY event_type ASC
    `
    const [types] = await db.query(query)

    res.json({
      code: 200,
      message: 'success',
      data: types.map((type) => type.event_type),
    })
  } catch (error) {
    console.error('Error fetching game types:', error)
    res.status(500).json({
      code: 500,
      message: '獲取遊戲類型失敗',
      error: error.message,
    })
  }
})

// 獲取所有唯一的平台
router.get('/filters/platforms', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT event_platform 
      FROM event_type 
      WHERE valid = 1 
      ORDER BY event_platform ASC
    `
    const [platforms] = await db.query(query)

    res.json({
      code: 200,
      message: 'success',
      data: platforms.map((platform) => platform.event_platform),
    })
  } catch (error) {
    console.error('Error fetching platforms:', error)
    res.status(500).json({
      code: 500,
      message: '獲取平台列表失敗',
      error: error.message,
    })
  }
})

// 獲取活動列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 12,
      status = '',
      type = '',
      platform = '',
      teamType = '',
      keyword = '',
    } = req.query
    const offset = (page - 1) * pageSize

    // 基礎查詢
    let query = `
      SELECT 
        et.*,
        (SELECT COUNT(*) 
         FROM event_registration er 
         WHERE er.event_id = et.event_id 
         AND er.registration_status = "active"
        ) as current_participants,
        CASE 
          WHEN NOW() < et.apply_start_time THEN '即將開始報名'
          WHEN NOW() BETWEEN et.apply_start_time AND et.apply_end_time THEN '報名中'
          WHEN NOW() BETWEEN et.apply_end_time AND et.event_end_time THEN '進行中'
          ELSE '已結束'
        END as event_status
      FROM event_type et
      WHERE et.valid = 1
    `

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM event_type et
      WHERE et.valid = 1
    `

    const queryParams = []
    const countParams = []

    // 條件陣列 - 用於收集所有篩選條件
    const conditions = []

    // 遊戲類型篩選
    if (type && type !== '全部遊戲' && type !== '全部遊戲') {
      conditions.push('et.event_type = ?')
      queryParams.push(type)
      countParams.push(type)
    }

    // 平台篩選
    if (platform && platform !== '平台') {
      // 處理 Mobile/PC 格式
      if (platform === 'Mobile') {
        conditions.push(
          '(et.event_platform LIKE ? OR et.event_platform LIKE ?)'
        )
        queryParams.push('Mobile%', '%Mobile%')
        countParams.push('Mobile%', '%Mobile%')
      } else if (platform === 'PC') {
        conditions.push(
          '(et.event_platform LIKE ? OR et.event_platform LIKE ?)'
        )
        queryParams.push('PC%', '%PC%')
        countParams.push('PC%', '%PC%')
      } else {
        conditions.push('et.event_platform = ?')
        queryParams.push(platform)
        countParams.push(platform)
      }
    }

    // 個人/團隊篩選
    if (teamType && teamType !== '個人/團隊') {
      let dbTeamType
      if (teamType === '團隊') {
        dbTeamType = '團體'
      } else if (teamType === '個人') {
        dbTeamType = '個人'
      }

      if (dbTeamType) {
        conditions.push('et.individual_or_team = ?')
        queryParams.push(dbTeamType)
        countParams.push(dbTeamType)
      }
    }

    // 關鍵字搜尋
    if (keyword && keyword.trim()) {
      conditions.push(`(
        LOWER(et.event_name) LIKE LOWER(?) OR
        LOWER(et.event_type) LIKE LOWER(?) OR
        LOWER(et.event_platform) LIKE LOWER(?) OR
        LOWER(et.event_content) LIKE LOWER(?)
      )`)
      const searchTerm = `%${keyword.trim()}%`
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm)
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }

    // 狀態篩選
    if (status) {
      const statusCondition = {
        進行中: 'NOW() BETWEEN et.apply_end_time AND et.event_end_time',
        報名中: 'NOW() BETWEEN et.apply_start_time AND et.apply_end_time',
        即將開始報名: 'NOW() < et.apply_start_time',
        已結束: 'NOW() > et.event_end_time',
      }[status]

      if (statusCondition) {
        conditions.push(statusCondition)
      }
    }

    // 組合所有條件
    if (conditions.length > 0) {
      const whereClause = conditions.join(' AND ')
      query += ` AND (${whereClause})`
      countQuery += ` AND (${whereClause})`
    }

    // 添加排序和分頁
    query += ` ORDER BY et.created_at DESC LIMIT ? OFFSET ?`
    queryParams.push(parseInt(pageSize), offset)

    // 執行查詢
    console.log('Executing query:', query, queryParams)

    const [events] = await db.query(query, queryParams)
    const [totalRows] = await db.query(countQuery, countParams)

    res.json({
      code: 200,
      message: 'success',
      data: {
        events: events.map((event) => ({
          id: event.event_id,
          name: event.event_name,
          type: event.event_type,
          platform: event.event_platform,
          content: event.event_content,
          rule: event.event_rule,
          award: event.event_award,
          teamType: event.individual_or_team,
          picture: event.event_picture,
          applyStartTime: event.apply_start_time,
          applyEndTime: event.apply_end_time,
          eventStartTime: event.event_start_time,
          eventEndTime: event.event_end_time,
          maxPeople: event.maximum_people,
          currentParticipants: parseInt(event.current_participants) || 0,
          status: event.event_status,
          createdAt: event.created_at,
        })),
        total: totalRows[0].total,
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    res.status(500).json({
      code: 500,
      message: '獲取活動資料失敗',
      error: error.message,
    })
  }
})
// 獲取單一活動詳情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const query = `
      SELECT 
        et.*,
        (SELECT COUNT(*) 
         FROM event_registration er 
         WHERE er.event_id = et.event_id 
         AND er.registration_status = 'active'
        ) as current_participants,
        CASE 
          WHEN NOW() < et.apply_start_time THEN '即將開始報名'
          WHEN NOW() BETWEEN et.apply_start_time AND et.apply_end_time THEN '報名中'
          WHEN NOW() BETWEEN et.apply_end_time AND et.event_end_time THEN '進行中'
          ELSE '已結束'
        END as event_status
      FROM event_type et
      WHERE et.event_id = ? AND et.valid = 1
    `

    const [results] = await db.query(query, [id])

    if (results.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '活動不存在',
      })
    }

    const event = results[0]

    res.json({
      code: 200,
      message: 'success',
      data: {
        id: event.event_id,
        name: event.event_name,
        type: event.event_type,
        platform: event.event_platform,
        content: event.event_content,
        rule: event.event_rule,
        award: event.event_award,
        teamType: event.individual_or_team,
        picture: event.event_picture,
        applyStartTime: event.apply_start_time,
        applyEndTime: event.apply_end_time,
        eventStartTime: event.event_start_time,
        eventEndTime: event.event_end_time,
        maxPeople: event.maximum_people,
        currentParticipants: parseInt(event.current_participants) || 0,
        status: event.event_status,
        createdAt: event.created_at,
      },
    })
  } catch (error) {
    console.error('Error fetching event details:', error)
    res.status(500).json({
      code: 500,
      message: '獲取活動詳情失敗',
      error: error.message,
    })
  }
})

// 獲取即將開始報名的活動
router.get('/upcoming', async (req, res) => {
  try {
    const { limit = 3 } = req.query

    const query = `
      SELECT 
        et.*,
        (SELECT COUNT(*) 
         FROM event_registration er 
         WHERE er.event_id = et.event_id 
         AND er.registration_status = "active"
        ) as current_participants
      FROM event_type et
      WHERE et.valid = 1
      AND NOW() < et.apply_start_time
      ORDER BY et.apply_start_time ASC
      LIMIT ?
    `

    const [events] = await db.query(query, [parseInt(limit)])

    res.json({
      code: 200,
      message: 'success',
      data: events.map((event) => ({
        id: event.event_id,
        name: event.event_name,
        type: event.event_type,
        platform: event.event_platform,
        teamType: event.individual_or_team,
        picture: event.event_picture,
        applyStartTime: event.apply_start_time,
        applyEndTime: event.apply_end_time,
        eventStartTime: event.event_start_time,
        maxPeople: event.maximum_people,
        currentParticipants: parseInt(event.current_participants) || 0,
      })),
    })
  } catch (error) {
    console.error('Error fetching upcoming events:', error)
    res.status(500).json({
      code: 500,
      message: '獲取即將開始報名活動失敗',
      error: error.message,
    })
  }
})

// 獲取使用者報名的活動
router.get('/user/registered', checkAuth, async (req, res) => {
  try {
    const query = `
      SELECT 
        et.*,
        (SELECT COUNT(*) 
         FROM event_registration er 
         WHERE er.event_id = et.event_id 
         AND er.registration_status = 'active'
        ) as current_participants,
        er.registration_time,
        er.registration_status,
        CASE 
          WHEN NOW() < et.apply_start_time THEN '即將開始報名'
          WHEN NOW() BETWEEN et.apply_start_time AND et.apply_end_time THEN '報名中'
          WHEN NOW() BETWEEN et.apply_end_time AND et.event_end_time THEN '進行中'
          ELSE '已結束'
        END as event_status
      FROM event_registration er
      JOIN event_type et ON er.event_id = et.event_id
      WHERE er.user_id = ? AND er.registration_status = 'active'
      ORDER BY er.registration_time DESC
    `

    const [events] = await db.query(query, [req.user.user_id])

    res.json({
      code: 200,
      message: 'success',
      data: {
        events: events.map((event) => ({
          id: event.event_id,
          name: event.event_name,
          type: event.event_type,
          platform: event.event_platform,
          content: event.event_content,
          rule: event.event_rule,
          award: event.event_award,
          teamType: event.individual_or_team,
          picture: event.event_picture,
          applyStartTime: event.apply_start_time,
          applyEndTime: event.apply_end_time,
          eventStartTime: event.event_start_time,
          eventEndTime: event.event_end_time,
          maxPeople: event.maximum_people,
          currentParticipants: parseInt(event.current_participants) || 0,
          status: event.event_status,
          registrationTime: event.registration_time,
          registrationStatus: event.registration_status,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching user events:', error)
    res.status(500).json({
      code: 500,
      message: '獲取活動列表失敗',
      error: error.message,
    })
  }
})

// 個人報名
router.post('/:eventId/register/individual', checkAuth, async (req, res) => {
  let connection
  try {
    const { eventId } = req.params
    const userId = req.user.user_id
    const { participantInfo } = req.body

    // 驗證必要資料
    if (
      !participantInfo ||
      !participantInfo.name ||
      !participantInfo.gameId ||
      !participantInfo.phone ||
      !participantInfo.email
    ) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要的報名資訊',
      })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    // 檢查活動是否存在且為個人賽
    const [eventDetails] = await connection.query(
      'SELECT individual_or_team, maximum_people, apply_start_time, apply_end_time FROM event_type WHERE event_id = ? AND valid = 1',
      [eventId]
    )

    if (eventDetails.length === 0) {
      throw new Error('活動不存在')
    }

    if (eventDetails[0].individual_or_team !== '個人') {
      throw new Error('此活動不是個人賽')
    }

    // 檢查是否在報名期間
    const now = new Date()
    const applyStartTime = new Date(eventDetails[0].apply_start_time)
    const applyEndTime = new Date(eventDetails[0].apply_end_time)

    if (now < applyStartTime) {
      throw new Error('報名未開始')
    }

    if (now > applyEndTime) {
      throw new Error('報名已結束')
    }

    // 檢查是否已報名
    const [registrations] = await connection.query(
      'SELECT * FROM event_registration WHERE event_id = ? AND user_id = ? AND registration_status = "active"',
      [eventId, userId]
    )

    if (registrations.length > 0) {
      throw new Error('您已報名此活動')
    }

    // 檢查活動是否已額滿
    const [currentParticipants] = await connection.query(
      'SELECT COUNT(*) as count FROM event_registration WHERE event_id = ? AND registration_status = "active"',
      [eventId]
    )

    if (currentParticipants[0].count >= eventDetails[0].maximum_people) {
      throw new Error('活動已額滿')
    }

    // 儲存報名資訊
    const registrationData = {
      event_id: eventId,
      user_id: userId,
      participant_info: JSON.stringify(participantInfo),
      registration_time: new Date(),
      registration_status: 'active',
    }

    await connection.query(
      'INSERT INTO event_registration SET ?',
      registrationData
    )

    // 更新活動的當前參與人數
    await connection.query(
      'UPDATE event_type SET current_participants = (SELECT COUNT(*) FROM event_registration WHERE event_id = ? AND registration_status = "active") WHERE event_id = ?',
      [eventId, eventId]
    )

    await connection.commit()

    res.json({
      code: 200,
      message: '報名成功',
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }
    console.error('個人報名失敗:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '報名失敗',
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

// 團體報名（修改後的版本）
router.post('/:eventId/register/team', checkAuth, async (req, res) => {
  let connection
  try {
    const { eventId } = req.params
    const userId = req.user.user_id
    const { teamName, captainInfo, teamMembers } = req.body

    // 驗證必要資料
    if (!teamName || !captainInfo || !teamMembers) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要的報名資訊',
      })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    // 檢查活動是否存在且為團體賽
    const [eventDetails] = await connection.query(
      'SELECT * FROM event_type WHERE event_id = ? AND valid = 1',
      [eventId]
    )

    if (eventDetails.length === 0) {
      throw new Error('活動不存在')
    }

    // 記錄活動類型以便除錯
    console.log('活動類型檢查:', {
      活動ID: eventId,
      活動類型: eventDetails[0].individual_or_team,
    })

    // 修改後的判斷邏輯，同時接受 '團體' 和 '團隊'
    if (!['團體', '團隊'].includes(eventDetails[0].individual_or_team)) {
      throw new Error('此活動不是團體賽')
    }

    // 檢查是否在報名期間
    const now = new Date()
    const applyStartTime = new Date(eventDetails[0].apply_start_time)
    const applyEndTime = new Date(eventDetails[0].apply_end_time)

    if (now < applyStartTime) {
      throw new Error('報名未開始')
    }

    if (now > applyEndTime) {
      throw new Error('報名已結束')
    }

    // 檢查是否已報名
    const [registrations] = await connection.query(
      'SELECT * FROM event_registration WHERE event_id = ? AND user_id = ? AND registration_status = "active"',
      [eventId, userId]
    )

    if (registrations.length > 0) {
      throw new Error('您已報名此活動')
    }

    // 檢查活動是否已額滿
    const [currentParticipants] = await connection.query(
      'SELECT COUNT(*) as count FROM event_registration WHERE event_id = ? AND registration_status = "active"',
      [eventId]
    )

    if (currentParticipants[0].count >= eventDetails[0].maximum_people) {
      throw new Error('活動已額滿')
    }

    // 儲存報名資訊
    const registrationData = {
      event_id: eventId,
      user_id: userId,
      participant_info: JSON.stringify({
        teamName,
        captainInfo,
        teamMembers,
      }),
      registration_time: new Date(),
      registration_status: 'active',
    }

    await connection.query(
      'INSERT INTO event_registration SET ?',
      registrationData
    )

    // 更新活動的當前參與人數
    await connection.query(
      'UPDATE event_type SET current_participants = (SELECT COUNT(*) FROM event_registration WHERE event_id = ? AND registration_status = "active") WHERE event_id = ?',
      [eventId, eventId]
    )

    await connection.commit()

    res.json({
      code: 200,
      message: '報名成功',
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }
    console.error('團體報名失敗:', {
      error: error.message,
      eventId: req.params.eventId,
      stack: error.stack,
    })
    res.status(500).json({
      code: 500,
      message: error.message || '報名失敗',
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

// 取消報名
router.delete('/:eventId/registration', checkAuth, async (req, res) => {
  let connection
  try {
    const { eventId } = req.params
    const userId = req.user.user_id

    connection = await db.getConnection()
    await connection.beginTransaction()

    // 檢查活動是否存在
    const [eventDetails] = await connection.query(
      'SELECT * FROM event_type WHERE event_id = ? AND valid = 1',
      [eventId]
    )

    if (eventDetails.length === 0) {
      throw new Error('活動不存在')
    }

    // 檢查是否已報名
    const [registrations] = await connection.query(
      'SELECT * FROM event_registration WHERE event_id = ? AND user_id = ? AND registration_status = "active"',
      [eventId, userId]
    )

    if (registrations.length === 0) {
      throw new Error('您尚未報名此活動')
    }

    // 檢查是否可以取消報名（活動開始前都可以取消）
    const now = new Date()
    const eventStartTime = new Date(eventDetails[0].event_start_time)

    if (now >= eventStartTime) {
      throw new Error('活動已開始，無法取消報名')
    }

    // 更新報名狀態
    await connection.query(
      'UPDATE event_registration SET registration_status = "cancelled" WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    )

    // 更新活動的當前參與人數
    await connection.query(
      'UPDATE event_type SET current_participants = (SELECT COUNT(*) FROM event_registration WHERE event_id = ? AND registration_status = "active") WHERE event_id = ?',
      [eventId, eventId]
    )

    await connection.commit()

    res.json({
      code: 200,
      message: '取消報名成功',
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }
    console.error('取消報名失敗:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '取消報名失敗',
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

// 檢查報名狀態
router.get('/:eventId/check-registration', checkAuth, async (req, res) => {
  try {
    const { eventId } = req.params
    const userId = req.user.user_id

    const [registrations] = await db.query(
      `SELECT er.*, 
                et.individual_or_team,
                et.event_name,
                er.participant_info
         FROM event_registration er
         JOIN event_type et ON er.event_id = et.event_id
         WHERE er.event_id = ? AND er.user_id = ? AND er.registration_status = "active"`,
      [eventId, userId]
    )

    if (registrations.length === 0) {
      return res.json({
        code: 200,
        message: 'success',
        data: {
          isRegistered: false,
        },
      })
    }

    const registration = registrations[0]
    const participantInfo = JSON.parse(registration.participant_info || '{}')

    const registrationInfo = {
      isRegistered: true,
      eventName: registration.event_name,
      registrationType: registration.individual_or_team,
      registrationTime: registration.registration_time,
      registrationStatus: registration.registration_status,
      participantInfo: participantInfo,
    }

    res.json({
      code: 200,
      message: 'success',
      data: registrationInfo,
    })
  } catch (error) {
    console.error('檢查報名狀態失敗:', error)
    res.status(500).json({
      code: 500,
      message: '檢查報名狀態失敗',
      error: error.message,
    })
  }
})

// 獲取活動報名列表（管理員用）
router.get('/:eventId/registrations', checkAuth, async (req, res) => {
  try {
    const { eventId } = req.params
    const { page = 1, pageSize = 10 } = req.query
    const offset = (page - 1) * pageSize

    // 檢查用戶權限
    if (req.user.level < 1) {
      return res.status(403).json({
        code: 403,
        message: '沒有權限查看此資訊',
      })
    }

    // 獲取活動報名列表
    const [registrations] = await db.query(
      `SELECT 
          er.*,
          et.individual_or_team,
          u.name as user_name,
          u.email as user_email
        FROM event_registration er
        JOIN event_type et ON er.event_id = et.event_id
        JOIN users u ON er.user_id = u.user_id
        WHERE er.event_id = ? AND er.registration_status = "active"
        ORDER BY er.registration_time DESC
        LIMIT ? OFFSET ?`,
      [eventId, parseInt(pageSize), offset]
    )

    // 獲取總報名數
    const [totalCount] = await db.query(
      'SELECT COUNT(*) as total FROM event_registration WHERE event_id = ? AND registration_status = "active"',
      [eventId]
    )

    const formattedRegistrations = registrations.map((reg) => ({
      id: reg.id,
      userId: reg.user_id,
      userName: reg.user_name,
      userEmail: reg.user_email,
      registrationType: reg.individual_or_team,
      registrationTime: reg.registration_time,
      participantInfo: JSON.parse(reg.participant_info || '{}'),
    }))

    res.json({
      code: 200,
      message: 'success',
      data: {
        registrations: formattedRegistrations,
        total: totalCount[0].total,
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    })
  } catch (error) {
    console.error('獲取報名列表失敗:', error)
    res.status(500).json({
      code: 500,
      message: '獲取報名列表失敗',
      error: error.message,
    })
  }
})

// 獲取所有唯一的遊戲類型
router.get('/filters/types', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT event_type 
      FROM event_type 
      WHERE valid = 1 
      ORDER BY event_type ASC
    `
    const [types] = await db.query(query)

    res.json({
      code: 200,
      message: 'success',
      data: types.map((type) => type.event_type),
    })
  } catch (error) {
    console.error('Error fetching game types:', error)
    res.status(500).json({
      code: 500,
      message: '獲取遊戲類型失敗',
      error: error.message,
    })
  }
})

// 獲取所有唯一的平台
router.get('/filters/platforms', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT event_platform 
      FROM event_type 
      WHERE valid = 1 
      ORDER BY event_platform ASC
    `
    const [platforms] = await db.query(query)

    res.json({
      code: 200,
      message: 'success',
      data: platforms.map((platform) => platform.event_platform),
    })
  } catch (error) {
    console.error('Error fetching platforms:', error)
    res.status(500).json({
      code: 500,
      message: '獲取平台列表失敗',
      error: error.message,
    })
  }
})

export default router
