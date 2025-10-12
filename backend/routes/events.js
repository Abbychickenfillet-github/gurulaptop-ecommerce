import express from 'express'
import pool from '../configs/pgClient.js'
import authenticate from '../middlewares/authenticate.js'

const router = express.Router()

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
      sort = 'nearest'
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(pageSize)

    // 構建查詢條件
    let whereConditions = []
    let queryParams = []
    let paramIndex = 1

    // 狀態篩選
    if (status) {
      if (status === '即將開始報名') {
        whereConditions.push(`NOW() < et.apply_start_time`)
      } else if (status === '報名中') {
        whereConditions.push(`NOW() BETWEEN et.apply_start_time AND et.apply_end_time`)
      } else if (status === '進行中') {
        whereConditions.push(`NOW() BETWEEN et.apply_end_time AND et.event_end_time`)
      } else if (status === '已結束') {
        whereConditions.push(`NOW() > et.event_end_time`)
      }
    }

    // 類型篩選
    if (type) {
      whereConditions.push(`et.event_type = $${paramIndex}`)
      queryParams.push(type)
      paramIndex++
    }

    // 平台篩選
    if (platform) {
      whereConditions.push(`et.event_platform = $${paramIndex}`)
      queryParams.push(platform)
      paramIndex++
    }

    // 團隊類型篩選
    if (teamType) {
      whereConditions.push(`et.individual_or_team = $${paramIndex}`)
      queryParams.push(teamType)
      paramIndex++
    }

    // 關鍵字搜尋
    if (keyword) {
      whereConditions.push(`(et.event_name ILIKE $${paramIndex} OR et.event_content ILIKE $${paramIndex})`)
      queryParams.push(`%${keyword}%`)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // 排序
    let orderClause = ''
    if (sort === 'nearest') {
      orderClause = 'ORDER BY et.apply_start_time ASC'
    } else if (sort === 'latest') {
      orderClause = 'ORDER BY et.event_start_time DESC'
    }

    // 查詢總數
    const countQuery = `
      SELECT COUNT(*) as total
      FROM event_type et
      ${whereClause}
    `
    const { rows: countResult } = await pool.query(countQuery, queryParams)
    const total = parseInt(countResult[0].total)

    // 查詢活動列表
    const eventsQuery = `
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
      ${whereClause}
      ${orderClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    queryParams.push(parseInt(pageSize), offset)
    const { rows: events } = await pool.query(eventsQuery, queryParams)

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
        })),
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / parseInt(pageSize))
      },
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    res.status(500).json({
      code: 500,
      message: '獲取活動列表失敗',
      error: error.message,
    })
  }
})

// 獲取活動類型篩選選項
router.get('/filters/types', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT event_type as type
      FROM event_type
      WHERE event_type IS NOT NULL AND event_type != ''
      ORDER BY event_type
    `)

    res.json({
      code: 200,
      message: 'success',
      data: rows.map(row => row.type),
    })
  } catch (error) {
    console.error('Error fetching event types:', error)
    res.status(500).json({
      code: 500,
      message: '獲取活動類型失敗',
      error: error.message,
    })
  }
})

// 獲取平台篩選選項
router.get('/filters/platforms', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT event_platform as platform
      FROM event_type
      WHERE event_platform IS NOT NULL AND event_platform != ''
      ORDER BY event_platform
    `)

    res.json({
      code: 200,
      message: 'success',
      data: rows.map(row => row.platform),
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

// 獲取單一活動詳情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { rows: events } = await pool.query(`
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
      WHERE et.event_id = $1 AND et.valid = true
    `, [id])

    if (events.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '活動不存在',
      })
    }

    const event = events[0]

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
      },
    })
  } catch (error) {
    console.error('Error fetching event detail:', error)
    res.status(500).json({
      code: 500,
      message: '獲取活動詳情失敗',
      error: error.message,
    })
  }
})

// 獲取使用者報名的活動
router.get('/user/registered', authenticate, async (req, res) => {

  try {
    const { rows: events } = await pool.query(`
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
      WHERE er.user_id = $1 AND er.registration_status = 'active'
      ORDER BY er.registration_time DESC
    `, [req.user.user_id])

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

// 團隊註冊 API
router.post('/:eventId/register/team', authenticate, async (req, res) => {
  const client = await pool.connect()

  try {
    const { eventId } = req.params
    const { teamName, captainInfo, teamMembers } = req.body
    const userId = req.user.user_id // 從 JWT token 中獲取用戶 ID

    // 驗證必要資料
    if (!teamName || !captainInfo || !teamMembers) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要資料'
      })
    }

    // 開始事務
    await client.query('BEGIN')

    // 插入團隊記錄（使用原生 JSON 支援）
    const { rows: insertResult } = await client.query(`
      INSERT INTO event_teams (event_id, user_id, team_name, captain_info)
      VALUES ($1, $2, $3, $4)
      RETURNING team_id
    `, [
      eventId,
      userId,
      teamName,
      captainInfo  // 直接傳入物件，讓 PostgreSQL 自動轉換
    ])

    const teamId = insertResult[0].team_id

    // 更新活動參與人數
    await client.query(`
      UPDATE event_type
      SET current_participants = current_participants + $1
      WHERE event_id = $2
    `, [teamCount, eventId])

    // 提交事務
    await client.query('COMMIT')

    res.status(200).json({
      status: 'success',
      code: 200,
      message: '團隊註冊成功',
      data: {
        teamId,
        teamName,
        teamCount: teamCount,
        captainInfo,
        teamMembers
      }
    })

  } catch (error) {
    // 回滾事務
    await client.query('ROLLBACK')

    console.error('團隊註冊錯誤:', error)
    res.status(500).json({
      status: 'error',
      message: '註冊失敗',
      error: error.message
    })
  } finally {
    client.release()
  }
})

export default router
