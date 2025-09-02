import express from 'express'
import pool from '../configs/pgClient.js'
import authenticate from '../middlewares/authenticate.js'

const router = express.Router()

// 獲取使用者報名的活動
router.get('/user/registered', authenticate, async (req, res) => {
  console.log("error");
  
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

export default router
