import express from 'express'
import pool from '../configs/pgClient.js'
import { checkAuth } from './auth.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// 獲取所有唯一的遊戲類型
router.get('/filters/types', async (req, res) => {
  try {
    const { rows: types } = await pool.query(`
      SELECT DISTINCT event_type 
      FROM event_type 
      WHERE valid = TRUE 
      ORDER BY event_type ASC
    `)

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
    const { rows: platforms } = await pool.query(`
      SELECT DISTINCT event_platform 
      FROM event_type 
      WHERE valid = TRUE 
      ORDER BY event_platform ASC
    `)

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
         AND er.registration_status = 'active'
        ) as current_participants,
        CASE 
          WHEN NOW() < et.apply_start_time THEN '即將開始報名'
          WHEN NOW() BETWEEN et.apply_start_time AND et.apply_end_time THEN '報名中'
          WHEN NOW() BETWEEN et.apply_end_time AND et.event_end_time THEN '進行中'
          ELSE '已結束'
        END as event_status
      FROM event_type et
      WHERE et.valid = TRUE
    `

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM event_type et
      WHERE et.valid = TRUE
    `

    const queryParams = []
    const countParams = []

    // 條件陣列 - 用於收集所有篩選條件
    const conditions = []

    // 遊戲類型篩選
    if (type && type !== '全部遊戲') {
      conditions.push('et.event_type = $1')
      queryParams.push(type)
      countParams.push(type)
    }

    // 平台篩選
    if (platform && platform !== '平台') {
      if (platform === 'Mobile') {
        conditions.push('(et.event_platform LIKE $1 OR et.event_platform LIKE $2)')
        queryParams.push('Mobile%', '%Mobile%')
        countParams.push('Mobile%', '%Mobile%')
      } else if (platform === 'PC') {
        conditions.push('(et.event_platform LIKE $1 OR et.event_platform LIKE $2)')
        queryParams.push('PC%', '%PC%')
        countParams.push('PC%', '%PC%')
      } else {
        conditions.push('et.event_platform = $1')
        queryParams.push(platform)
        countParams.push(platform)
      }
    }

    // 個人/團隊篩選
    if (teamType && teamType !== '個人/團隊') {
      let dbTeamType
      if (teamType === '團隊') {
        dbTeamType = '團隊'
      } else if (teamType === '個人') {
        dbTeamType = '個人'
      }

      if (dbTeamType) {
        conditions.push('et.individual_or_team = $1')
        queryParams.push(dbTeamType)
        countParams.push(dbTeamType)
      }
    }

    // 關鍵字搜尋
    if (keyword && keyword.trim()) {
      conditions.push(`(
        LOWER(et.event_name) LIKE LOWER($1) OR
        LOWER(et.event_type) LIKE LOWER($2) OR
        LOWER(et.event_platform) LIKE LOWER($3) OR
        LOWER(et.event_content) LIKE LOWER($4)
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
    query += ` ORDER BY et.created_at DESC LIMIT $1 OFFSET $2`
    queryParams.push(parseInt(pageSize), offset)

    // 執行查詢
    const { rows: events } = await pool.query(query, queryParams)
    const { rows: totalRows } = await pool.query(countQuery, countParams)

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
router.get('/:event_id', async (req, res) => {
  try {
    const { event_id } = req.params

    const { rows: results } = await pool.query(`
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
      WHERE et.event_id = $1 AND et.valid = TRUE
    `, [event_id])

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

    const { rows: events } = await pool.query(`
      SELECT 
        et.*,
        (SELECT COUNT(*) 
         FROM event_registration er 
         WHERE er.event_id = et.event_id 
         AND er.registration_status = 'active'
        ) as current_participants
      FROM event_type et
      WHERE et.valid = TRUE
      AND NOW() < et.apply_start_time
      ORDER BY et.apply_start_time ASC
      LIMIT $1
    `, [parseInt(limit)])

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

// 個人報名
router.post('/:event_id/register/individual', checkAuth, async (req, res) => {
  const client = await pool.connect()
  const { event_id } = req.params
  const userId = req.user.user_id
  const { participantInfo } = req.body

  try {
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

    await client.query('BEGIN')

    // 檢查活動是否存在且為個人賽
    const { rows: eventDetails } = await client.query(`
      SELECT individual_or_team, maximum_people, apply_start_time, apply_end_time 
      FROM event_type 
      WHERE event_id = $1 AND valid = TRUE
    `, [event_id])

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
    const { rows: registrations } = await client.query(`
      SELECT * FROM event_registration 
      WHERE event_id = $1 AND user_id = $2 AND registration_status = 'active'
    `, [event_id, userId])

    if (registrations.length > 0) {
      throw new Error('您已報名此活動')
    }

    // 檢查活動是否已額滿
    const { rows: [currentParticipants] } = await client.query(`
      SELECT COUNT(*) as count 
      FROM event_registration 
      WHERE event_id = $1 AND registration_status = 'active'
    `, [event_id])

    if (currentParticipants.count >= eventDetails[0].maximum_people) {
      throw new Error('活動已額滿')
    }

    // 儲存報名資訊
    const { rows: [newRegistration] } = await client.query(`
      INSERT INTO event_registration (
        event_id, user_id, participant_info, registration_time, registration_status
      ) VALUES ($1, $2, $3, NOW(), $4)
      RETURNING *
    `, [event_id, userId, JSON.stringify(participantInfo), 'active'])

    // 更新活動的當前參與人數
    await client.query(`
      UPDATE event_type 
      SET current_participants = (SELECT COUNT(*) 
                                  FROM event_registration 
                                  WHERE event_id = $1 
                                  AND registration_status = 'active')
      WHERE event_id = $1
    `, [event_id])

    await client.query('COMMIT')

    res.json({
      code: 200,
      message: '報名成功',
      data: {
        registrationId: newRegistration.id,
        registrationTime: new Date().toISOString(),
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('個人報名失敗:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '報名失敗',
    })
  } finally {
    client.release()
  }
})

// 團體報名
router.post('/:event_id/register/team', checkAuth, async (req, res) => {
  const client = await pool.connect()
  const { event_id } = req.params
  const userId = req.user.user_id
  const { teamName, captainInfo, teamMembers } = req.body

  try {
    // 驗證必要資料
    if (!teamName || !captainInfo || !teamMembers) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要的報名資訊',
      })
    }

    await client.query('BEGIN')

    // 檢查活動是否存在且為團體賽
    const { rows: eventDetails } = await client.query(`
      SELECT * FROM event_type 
      WHERE event_id = $1 AND valid = TRUE
    `, [event_id])

    if (eventDetails.length === 0) {
      throw new Error('活動不存在')
    }

    if (!['團隊', '團體'].includes(eventDetails[0].individual_or_team)) {
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
    const { rows: registrations } = await client.query(`
      SELECT * FROM event_registration 
      WHERE event_id = $1 AND user_id = $2 AND registration_status = 'active'
    `, [event_id, userId])

    if (registrations.length > 0) {
      throw new Error('您已報名此活動')
    }

    // 檢查活動是否已額滿
    const { rows: [currentParticipants] } = await client.query(`
      SELECT COUNT(*) as count 
      FROM event_registration 
      WHERE event_id = $1 AND registration_status = 'active'
    `, [event_id])

    if (currentParticipants.count >= eventDetails[0].maximum_people) {
      throw new Error('活動已額滿')
    }

    // 儲存報名資訊
    const { rows: [newRegistration] } = await client.query(`
      INSERT INTO event_registration (
        event_id, user_id, participant_info, registration_time, registration_status
      ) VALUES ($1, $2, $3, NOW(), $4)
      RETURNING *
    `, [event_id, userId, JSON.stringify({
      teamName,
      captainInfo,
      teamMembers,
    }), 'active'])

    // 更新活動的當前參與人數
    await client.query(`
      UPDATE event_type 
      SET current_participants = (SELECT COUNT(*) 
                                  FROM event_registration 
                                  WHERE event_id = $1 
                                  AND registration_status = 'active')
      WHERE event_id = $1
    `, [event_id])

    await client.query('COMMIT')

    res.json({
      code: 200,
      message: '報名成功',
      data: {
        registrationId: newRegistration.id,
        registrationTime: new Date().toISOString(),
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('團體報名失敗:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '報名失敗',
    })
  } finally {
    client.release()
  }
})

// 取消報名
router.delete('/:event_id/registration', checkAuth, async (req, res) => {
  const client = await pool.connect()
  const { event_id } = req.params
  const userId = req.user.user_id

  try {
    await client.query('BEGIN')

    // 檢查活動是否存在
    const { rows: eventDetails } = await client.query(`
      SELECT * FROM event_type 
      WHERE event_id = $1 AND valid = TRUE
    `, [event_id])

    if (eventDetails.length === 0) {
      throw new Error('活動不存在')
    }

    // 檢查是否已報名
    const { rows: registrations } = await client.query(`
      SELECT * FROM event_registration 
      WHERE event_id = $1 AND user_id = $2 AND registration_status = 'active'
    `, [event_id, userId])

    if (registrations.length === 0) {
      throw new Error('您尚未報名此活動')
    }

    // 檢查是否可以取消報名
    const now = new Date()
    const eventStartTime = new Date(eventDetails[0].event_start_time)

    if (now >= eventStartTime) {
      throw new Error('活動已開始，無法取消報名')
    }

    // 更新報名狀態
    const { rows: [updatedRegistration] } = await client.query(`
      UPDATE event_registration 
      SET registration_status = 'cancelled' 
      WHERE event_id = $1 AND user_id = $2
      RETURNING *
    `, [event_id, userId])

    await client.query('COMMIT')

    res.json({
      code: 200,
      message: '取消報名成功',
      data: updatedRegistration,
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('取消報名失敗:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '取消報名失敗',
    })
  } finally {
    client.release()
  }
})

// 檢查報名狀態
router.get('/:event_id/check-registration', checkAuth, async (req, res) => {
  try {
    const { event_id } = req.params
    const userId = req.user.user_id

    const { rows: registrations } = await pool.query(`
      SELECT 
        er.*,
        et.individual_or_team,
        et.event_name,
        er.participant_info
      FROM event_registration er
      JOIN event_type et ON er.event_id = et.event_id
      WHERE er.event_id = $1 AND er.user_id = $2 AND er.registration_status = 'active'
    `, [event_id, userId])

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
      participantInfo,
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
router.get('/:event_id/registrations', checkAuth, async (req, res) => {
  try {
    const { event_id } = req.params
    const { page = 1, pageSize = 10 } = req.query
    const offset = (page - 1) * pageSize

    // 檢查用戶權限
    if (req.user.level < 1) {
      return res.status(403).json({
        code: 403,
        message: '沒有權限查看此資訊',
      })
    }

    const { rows: registrations } = await pool.query(`
      SELECT 
        er.*,
        et.individual_or_team,
        u.name as user_name,
        u.email as user_email
      FROM event_registration er
      JOIN event_type et ON er.event_id = et.event_id
      JOIN users u ON er.user_id = u.user_id
      WHERE er.event_id = $1 AND er.registration_status = 'active'
      ORDER BY er.registration_time DESC
      LIMIT $2 OFFSET $3
    `, [event_id, parseInt(pageSize), offset])

    // 獲取總報名數
    const { rows: [totalCount] } = await pool.query(`
      SELECT COUNT(*) as total 
      FROM event_registration 
      WHERE event_id = $1 AND registration_status = 'active'
    `, [event_id])

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
        total: totalCount.total,
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

export default router