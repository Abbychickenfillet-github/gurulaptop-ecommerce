import db from '../configs/mysql.js'

export const ChatRoom = {
  create: async ({ roomName, creatorId }) => {
    try {
      const [result] = await db.execute(
        'INSERT INTO chat_rooms (name, creator_id) VALUES (?, ?)',
        [roomName, creatorId]
      )
      return result.insertId
    } catch (error) {
      console.error('建立聊天室錯誤:', error)
      throw error
    }
  },

  getAll: async () => {
    try {
      const [rooms] = await db.execute(`
        SELECT 
          cr.*,
          g.group_id,
          g.group_name,
          g.max_members,
          g.group_img,
          COUNT(DISTINCT crm.id) as member_count
        FROM chat_rooms cr
        LEFT JOIN \`group\` g ON cr.id = g.chat_room_id
        LEFT JOIN chat_room_members crm ON cr.id = crm.room_id
        WHERE cr.valid = 1
        GROUP BY cr.id
      `)
      return rooms
    } catch (error) {
      console.error('取得聊天室列表錯誤:', error)
      throw error
    }
  },

  getById: async (roomId) => {
    try {
      const [rooms] = await db.execute(
        'SELECT * FROM chat_rooms WHERE id = ? AND valid = 1',
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
      const [groups] = await db.execute(
        `
        SELECT 
          g.*,
          cr.id as chatRoomId,
          COUNT(DISTINCT gm.member_id) as member_count,
          u.name as creator_name
        FROM \`group\` g
        LEFT JOIN chat_rooms cr ON g.chat_room_id = cr.id
        LEFT JOIN group_members gm ON g.group_id = gm.group_id 
           AND gm.status = 'accepted'
        LEFT JOIN users u ON g.creator_id = u.user_id
        WHERE (g.creator_id = ? OR EXISTS (
          SELECT 1 
          FROM group_members 
          WHERE group_id = g.group_id 
          AND member_id = ? 
          AND status = 'accepted'
        ))
        GROUP BY g.group_id`,
        [userId, userId]
      )
      return groups
    } catch (error) {
      console.error('獲取使用者群組錯誤:', error)
      throw error
    }
  },

  getGroupById: async (groupId) => {
    try {
      const [groups] = await db.execute(
        'SELECT * FROM `group` WHERE group_id = ?',
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
      // 檢查是否已經是成員
      const [existingMember] = await db.execute(
        'SELECT 1 FROM chat_room_members WHERE room_id = ? AND user_id = ?',
        [roomId, userId]
      )

      if (existingMember.length > 0) {
        return existingMember[0].id
      }

      const [result] = await db.execute(
        'INSERT INTO chat_room_members (room_id, user_id) VALUES (?, ?)',
        [roomId, userId]
      )
      return result.insertId
    } catch (error) {
      console.error('加入成員錯誤:', error)
      throw error
    }
  },

  getMembers: async (roomId) => {
    try {
      const [members] = await db.execute(
        `SELECT u.user_id, u.name, u.image_path, crm.joined_at
         FROM chat_room_members crm
         JOIN users u ON crm.user_id = u.user_id
         WHERE crm.room_id = ?`,
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
      const [result] = await db.execute(
        'DELETE FROM chat_room_members WHERE room_id = ? AND user_id = ?',
        [roomId, userId]
      )
      return result.affectedRows > 0
    } catch (error) {
      console.error('移除成員錯誤:', error)
      throw error
    }
  },

  getPendingRequests: async (userId) => {
    try {
      const [requests] = await db.execute(
        `
        SELECT 
          gr.*,
          u.name as sender_name,
          u.image_path as sender_image,
          g.group_name,
          g.creator_id,
          g.chat_room_id
        FROM group_requests gr
        JOIN users u ON gr.sender_id = u.user_id
        JOIN \`group\` g ON gr.group_id = g.group_id
        WHERE g.creator_id = ? AND gr.status = 'pending'
        ORDER BY gr.created_at DESC`,
        [userId]
      )
      return requests
    } catch (error) {
      console.error('獲取待處理申請錯誤:', error)
      throw error
    }
  },

  getGroupRequestHistory: async (userId) => {
    try {
      const [history] = await db.execute(
        `
        SELECT 
          gr.*,
          u.name as sender_name,
          u.image_path as sender_image,
          g.group_name,
          g.creator_id,
          g.chat_room_id
        FROM group_requests gr
        JOIN users u ON gr.sender_id = u.user_id
        JOIN \`group\` g ON gr.group_id = g.group_id
        WHERE gr.sender_id = ? OR g.creator_id = ?
        ORDER BY gr.created_at DESC`,
        [userId, userId]
      )
      return history
    } catch (error) {
      console.error('獲取申請歷史錯誤:', error)
      throw error
    }
  },

  getGroupRequestById: async (requestId) => {
    try {
      const [requests] = await db.execute(
        `SELECT gr.*, g.chat_room_id, g.group_name, 
                u.name as sender_name, g.creator_id
         FROM group_requests gr
         JOIN \`group\` g ON gr.group_id = g.group_id
         JOIN users u ON gr.sender_id = u.user_id
         WHERE gr.id = ?`,
        [requestId]
      )
      return requests[0]
    } catch (error) {
      console.error('取得群組申請詳情錯誤:', error)
      throw error
    }
  },

  isMember: async (roomId, userId) => {
    try {
      const [result] = await db.execute(
        'SELECT 1 FROM chat_room_members WHERE room_id = ? AND user_id = ? LIMIT 1',
        [roomId, userId]
      )
      return result.length > 0
    } catch (error) {
      console.error('檢查成員資格錯誤:', error)
      throw error
    }
  },

  getMessages: async (roomId, limit = 50) => {
    try {
      const [messages] = await db.execute(
        `
        SELECT 
          cm.*,
          u.name as sender_name,
          u.image_path as sender_image,
          g.group_name,
          g.group_img
        FROM chat_messages cm
        JOIN users u ON cm.sender_id = u.user_id
        LEFT JOIN chat_rooms cr ON cm.room_id = cr.id
        LEFT JOIN \`group\` g ON cr.id = g.chat_room_id
        WHERE cm.room_id = ?
        ORDER BY cm.created_at ASC
        LIMIT ?
      `,
        [roomId, limit]
      )

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
      const [result] = await db.execute(
        `INSERT INTO chat_messages 
         (room_id, sender_id, message, is_private, recipient_id, is_system, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          roomId,
          senderId,
          message,
          isPrivate ? 1 : 0,
          recipientId,
          isSystem ? 1 : 0,
        ]
      )
      return result.insertId
    } catch (error) {
      console.error('儲存訊息錯誤:', error)
      throw error
    }
  },

  getUserById: async (userId) => {
    try {
      const [users] = await db.execute(
        'SELECT * FROM users WHERE user_id = ? AND valid = 1',
        [userId]
      )
      return users[0]
    } catch (error) {
      console.error('獲取用戶錯誤:', error)
      throw error
    }
  },

  updateGroupRequest: async (requestId, { status }) => {
    const connection = await db.getConnection()
    try {
      await connection.beginTransaction()

      await connection.execute(
        'UPDATE group_requests SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, requestId]
      )

      await connection.commit()
      return true
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  },

  addGroupMember: async (groupId, userId) => {
    const connection = await db.getConnection()
    try {
      await connection.beginTransaction()

      const [existingMember] = await connection.execute(
        'SELECT 1 FROM group_members WHERE group_id = ? AND member_id = ?',
        [groupId, userId]
      )

      if (!existingMember.length) {
        await connection.execute(
          'INSERT INTO group_members (group_id, member_id, status) VALUES (?, ?, "accepted")',
          [groupId, userId]
        )

        const [group] = await connection.execute(
          'SELECT chat_room_id FROM `group` WHERE group_id = ?',
          [groupId]
        )

        if (group[0]?.chat_room_id) {
          await connection.execute(
            'INSERT INTO chat_room_members (room_id, user_id) VALUES (?, ?)',
            [group[0].chat_room_id, userId]
          )
        }
      }

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  },
}

export default ChatRoom
