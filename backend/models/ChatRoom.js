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

  addGroupMember: async (groupId, userId) => {
    try {
      await db.execute(
        'INSERT INTO group_members (group_id, member_id, status) VALUES (?, ?, "accepted")',
        [groupId, userId]
      )

      const [room] = await db.execute(
        'SELECT chat_room_id FROM `group` WHERE group_id = ?',
        [groupId]
      )

      if (room[0]?.chat_room_id) {
        await db.execute(
          'INSERT INTO chat_room_members (room_id, user_id) VALUES (?, ?)',
          [room[0].chat_room_id, userId]
        )
      }
    } catch (error) {
      console.error('添加群組成員錯誤:', error)
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

  saveMessage: async ({
    roomId,
    senderId,
    message,
    isPrivate = false,
    recipientId = null,
  }) => {
    try {
      const [result] = await db.execute(
        `INSERT INTO chat_messages 
         (room_id, sender_id, message, is_private, recipient_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [roomId, senderId, message, isPrivate ? 1 : 0, recipientId]
      )
      return result.insertId
    } catch (error) {
      console.error('儲存訊息錯誤:', error)
      throw error
    }
  },

  saveGroupRequest: async ({
    groupId,
    senderId,
    creatorId,
    gameId,
    description,
  }) => {
    try {
      const [result] = await db.execute(
        `INSERT INTO group_requests 
         (group_id, sender_id, creator_id, game_id, description) 
         VALUES (?, ?, ?, ?, ?)`,
        [groupId, senderId, creatorId, gameId, description]
      )

      await db.execute(
        `INSERT INTO messages 
         (sender_id, receiver_id, type, content, metadata) 
         VALUES (?, ?, 'group_request', ?, ?)`,
        [
          senderId,
          creatorId,
          `申請加入群組`,
          JSON.stringify({
            requestId: result.insertId,
            groupId,
            gameId,
            description,
          }),
        ]
      )

      return result.insertId
    } catch (error) {
      console.error('儲存群組申請錯誤:', error)
      throw error
    }
  },

  getGroupRequestById: async (requestId) => {
    try {
      const [requests] = await db.execute(
        `SELECT gr.*, g.chat_room_id, g.group_name,
                u.name as sender_name
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

  updateGroupRequest: async (requestId, { status }) => {
    try {
      const [result] = await db.execute(
        'UPDATE group_requests SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, requestId]
      )
      return result.affectedRows > 0
    } catch (error) {
      console.error('更新群組申請狀態錯誤:', error)
      throw error
    }
  },

  getMessages: async (roomId, limit = 50) => {
    try {
      const [messages] = await db.execute(
        `SELECT 
         cm.*,
         u.name as sender_name,
         u.image_path as sender_image
         FROM chat_messages cm
         JOIN users u ON cm.sender_id = u.user_id
         WHERE cm.room_id = ?
         ORDER BY cm.created_at DESC
         LIMIT ?`,
        [roomId, limit]
      )
      return messages.reverse()
    } catch (error) {
      console.error('取得聊天記錄錯誤:', error)
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

  getUserGroups: async (userId) => {
    try {
      const [groups] = await db.execute(
        `SELECT 
         g.*,
         COUNT(DISTINCT gm.member_id) as member_count
         FROM \`group\` g
         LEFT JOIN group_members gm ON g.group_id = gm.group_id
         WHERE g.creator_id = ? OR gm.member_id = ?
         GROUP BY g.group_id`,
        [userId, userId]
      )
      return groups
    } catch (error) {
      console.error('獲取使用者群組錯誤:', error)
      throw error
    }
  },

  getGroupPendingRequests: async (groupId) => {
    try {
      const [requests] = await db.execute(
        `SELECT gr.*, 
         u.name as sender_name,
         u.image_path as sender_image
         FROM group_requests gr
         JOIN users u ON gr.sender_id = u.user_id
         WHERE gr.group_id = ? AND gr.status = 'pending'
         ORDER BY gr.created_at DESC`,
        [groupId]
      )
      return requests
    } catch (error) {
      console.error('獲取待處理申請錯誤:', error)
      throw error
    }
  },

  isGroupCreator: async (groupId, userId) => {
    try {
      const [result] = await db.execute(
        'SELECT 1 FROM `group` WHERE group_id = ? AND creator_id = ? LIMIT 1',
        [groupId, userId]
      )
      return result.length > 0
    } catch (error) {
      console.error('檢查群組創建者錯誤:', error)
      throw error
    }
  },
}

export default ChatRoom
