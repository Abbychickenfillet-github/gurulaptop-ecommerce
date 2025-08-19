import pool from '##/configs/pgClient.js'

export const ChatRoom = {
  create: async ({ roomName, creatorId }) => {
    try {
      const { rows: [result] } = await pool.query(
        'INSERT INTO chat_rooms (name, creator_id) VALUES ($1, $2) RETURNING id;',
        [roomName, creatorId]
      )
      return result.id
    } catch (error) {
      console.error('建立聊天室錯誤:', error)
      throw error
    }
  },

  getAll: async () => {
    try {
      const { rows: rooms } = await pool.query(`
        SELECT 
          cr.*,
          g.group_id,
          g.group_name,
          g.max_members,
          g.group_img,
          COUNT(DISTINCT crm.id) as member_count
        FROM chat_rooms cr
        LEFT JOIN "group" g ON cr.id = g.chat_room_id
        LEFT JOIN chat_room_members crm ON cr.id = crm.room_id
        WHERE cr.valid = TRUE
        GROUP BY cr.id, g.group_id, g.group_name, g.max_members, g.group_img;
      `)
      return rooms
    } catch (error) {
      console.error('取得聊天室列表錯誤:', error)
      throw error
    }
  },

  getById: async (roomId) => {
    try {
      const { rows: rooms } = await pool.query(
        'SELECT * FROM chat_rooms WHERE id = $1 AND valid = TRUE;',
        [roomId]
      )
      return rooms[0]
    } catch (error) {
      console.error('取得聊天室錯誤:', error)
      throw error
    }
  },

  getUserGroups: async (userId) => {
    try {
      const { rows: groups } = await pool.query(`
        SELECT 
          g.*,
          cr.id as chatRoomId,
          COUNT(DISTINCT gm.member_id) as member_count,
          u.name as creator_name
        FROM "group" g
        LEFT JOIN chat_rooms cr ON g.chat_room_id = cr.id
        LEFT JOIN group_members gm ON g.group_id = gm.group_id 
           AND gm.status = 'accepted'
        LEFT JOIN users u ON g.creator_id = u.user_id
        WHERE (g.creator_id = $1 OR EXISTS (
          SELECT 1 
          FROM group_members 
          WHERE group_id = g.group_id 
          AND member_id = $1 
          AND status = 'accepted'
        ))
        GROUP BY g.group_id, cr.id, u.name;
      `, [userId])
      return groups
    } catch (error) {
      console.error('獲取使用者群組錯誤:', error)
      throw error
    }
  },

  getGroupById: async (groupId) => {
    try {
      const { rows: groups } = await pool.query(
        'SELECT * FROM "group" WHERE group_id = $1;',
        [groupId]
      )
      return groups[0]
    } catch (error) {
      console.error('取得群組錯誤:', error)
      throw error
    }
  },

  addMember: async (roomId, userId) => {
    try {
      const { rows: existingMembers } = await pool.query(
        'SELECT 1 FROM chat_room_members WHERE room_id = $1 AND user_id = $2;',
        [roomId, userId]
      )

      if (existingMembers.length > 0) {
        return existingMembers[0].id
      }

      const { rows: [result] } = await pool.query(
        'INSERT INTO chat_room_members (room_id, user_id) VALUES ($1, $2) RETURNING id;',
        [roomId, userId]
      )
      return result.id
    } catch (error) {
      console.error('加入成員錯誤:', error)
      throw error
    }
  },

  getMembers: async (roomId) => {
    try {
      const { rows: members } = await pool.query(
        `SELECT u.user_id, u.name, u.image_path, crm.joined_at
         FROM chat_room_members crm
         JOIN users u ON crm.user_id = u.user_id
         WHERE crm.room_id = $1;`,
        [roomId]
      )
      return members
    } catch (error) {
      console.error('取得成員列表錯誤:', error)
      throw error
    }
  },

  removeMember: async (roomId, userId) => {
    try {
      const { rows: [result] } = await pool.query(
        'DELETE FROM chat_room_members WHERE room_id = $1 AND user_id = $2 RETURNING *;',
        [roomId, userId]
      )
      return result ? true : false
    } catch (error) {
      console.error('移除成員錯誤:', error)
      throw error
    }
  },

  getPendingRequests: async (userId) => {
    try {
      const { rows: requests } = await pool.query(`
        SELECT 
          gr.*,
          u.name as sender_name,
          u.image_path as sender_image,
          g.group_name,
          g.creator_id,
          g.chat_room_id
        FROM group_requests gr
        JOIN users u ON gr.sender_id = u.user_id
        JOIN "group" g ON gr.group_id = g.group_id
        WHERE g.creator_id = $1 AND gr.status = 'pending'
        ORDER BY gr.created_at DESC;
      `, [userId])
      return requests
    } catch (error) {
      console.error('獲取待處理申請錯誤:', error)
      throw error
    }
  },// 為什麼又突然資料庫連線失敗
  getGroupRequestHistory: async (userId) => {
    try {
      const { rows: history } = await pool.query(`
        SELECT 
          gr.*,
          u.name as sender_name,
          u.image_path as sender_image,
          g.group_name,
          g.creator_id,
          g.chat_room_id
        FROM group_requests gr
        JOIN users u ON gr.sender_id = u.user_id
        JOIN "group" g ON gr.group_id = g.group_id
        WHERE gr.sender_id = $1 OR g.creator_id = $1
        ORDER BY gr.created_at DESC;
      `, [userId])
      return history
    } catch (error) {
      console.error('獲取申請歷史錯誤:', error)
      throw error
    }
  },

  getGroupRequestById: async (requestId) => {
    try {
      const { rows: requests } = await pool.query(`
        SELECT gr.*, g.chat_room_id, g.group_name, 
               u.name as sender_name, g.creator_id
         FROM group_requests gr
         JOIN "group" g ON gr.group_id = g.group_id
         JOIN users u ON gr.sender_id = u.user_id
         WHERE gr.id = $1;
      `, [requestId])
      return requests[0]
    } catch (error) {
      console.error('取得群組申請詳情錯誤:', error)
      throw error
    }
  },

  isMember: async (roomId, userId) => {
    try {
      const { rows: [result] } = await pool.query(
        'SELECT 1 FROM chat_room_members WHERE room_id = $1 AND user_id = $2 LIMIT 1;',
        [roomId, userId]
      )
      return Boolean(result)
    } catch (error) {
      console.error('檢查成員資格錯誤:', error)
      throw error
    }
  },

  getMessages: async (roomId, limit = 50) => {
    try {
      const { rows: messages } = await pool.query(`
        SELECT 
          cm.*,
          u.name as sender_name,
          u.image_path as sender_image,
          g.group_name,
          g.group_img
        FROM chat_messages cm
        JOIN users u ON cm.sender_id = u.user_id
        LEFT JOIN chat_rooms cr ON cm.room_id = cr.id
        LEFT JOIN "group" g ON cr.id = g.chat_room_id
        WHERE cm.room_id = $1
        ORDER BY cm.created_at ASC
        LIMIT $2;
      `, [roomId, limit])

      return messages.map((msg) => ({
        id: msg.id,
        room_id: msg.room_id,
        sender_id: msg.sender_id,
        sender_name: msg.sender_name || '未知用戶',
        sender_image: msg.sender_image,
        message: msg.message || '',
        is_private: Boolean(msg.is_private),
        is_system: Boolean(msg.is_system),
        created_at: msg.created_at,
        group_name: msg.group_name,
        group_img: msg.group_img,
      }))
    } catch (error) {
      console.error('獲取訊息錯誤:', error)
      throw error
    }
  },

  saveMessage: async ({
    roomId,
    senderId,
    message,
    isPrivate = false,
    recipientId = null,
    isSystem = false,
  }) => {
    try {
      const { rows: [result] } = await pool.query(
        `INSERT INTO chat_messages 
         (room_id, sender_id, message, is_private, recipient_id, is_system, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id;`,
        [
          roomId,
          senderId,
          message,
          isPrivate,
          recipientId,
          isSystem,
        ]
      )
      return result.id
    } catch (error) {
      console.error('儲存訊息錯誤:', error)
      throw error
    }
  },

  getUserById: async (userId) => {
    try {
      const { rows: [user] } = await pool.query(
        'SELECT * FROM users WHERE user_id = $1 AND valid = TRUE;',
        [userId]
      )
      return user
    } catch (error) {
      console.error('獲取用戶錯誤:', error)
      throw error
    }
  },

  updateGroupRequest: async (requestId, { status }) => {
    let client
    try {
      client = await pool.connect()
      await client.query('BEGIN;')
      
      await client.query(
        'UPDATE group_requests SET status = $1, updated_at = NOW() WHERE id = $2;',
        [status, requestId]
      )

      await client.query('COMMIT;')
      return true
    } catch (error) {
      if (client) await client.query('ROLLBACK;')
      console.error('更新群組申請錯誤:', error)
      throw error
    } finally {
      if (client) client.release()
    }
  },

  addGroupMember: async (groupId, userId) => {
    let client
    try {
      client = await pool.connect()
      await client.query('BEGIN;')

      const { rows: existingMembers } = await client.query(
        'SELECT 1 FROM group_members WHERE group_id = $1 AND member_id = $2;',
        [groupId, userId]
      )

      if (existingMembers.length === 0) {
        await client.query(
          'INSERT INTO group_members (group_id, member_id, status) VALUES ($1, $2, $3);',
          [groupId, userId, 'accepted']
        )

        const { rows: [group] } = await client.query(
          'SELECT chat_room_id FROM "group" WHERE group_id = $1;',
          [groupId]
        )

        if (group.chat_room_id) {
          await client.query(
            'INSERT INTO chat_room_members (room_id, user_id) VALUES ($1, $2);',
            [group.chat_room_id, userId]
          )
        }
      }

      await client.query('COMMIT;')
    } catch (error) {
      if (client) await client.query('ROLLBACK;')
      console.error('新增群組成員錯誤:', error)
      throw error
    } finally {
      if (client) client.release()
    }
  },
}

export default ChatRoom