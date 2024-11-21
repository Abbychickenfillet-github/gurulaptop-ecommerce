import db from '../configs/mysql.js'

export const messageService = {
  // 儲存私人訊息
  savePrivateMessage: async (senderId, receiverId, content, type = 'text') => {
    const connection = await db.getConnection()
    try {
      await connection.beginTransaction()

      const [result] = await connection.execute(
        `INSERT INTO messages 
        (sender_id, receiver_id, type, content, status, created_at) 
        VALUES (?, ?, ?, ?, 'sent', NOW())`,
        [senderId, receiverId, type, content]
      )

      await connection.commit()
      return result.insertId
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  },

  // 儲存群組訊息
  saveGroupMessage: async (roomId, senderId, content, type = 'text') => {
    const connection = await db.getConnection()
    try {
      await connection.beginTransaction()

      const [result] = await connection.execute(
        `INSERT INTO chat_messages 
        (room_id, sender_id, message, message_type, status, created_at) 
        VALUES (?, ?, ?, ?, 'sent', NOW())`,
        [roomId, senderId, content, type]
      )

      await connection.commit()
      return result.insertId
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  },

  // 更新訊息狀態
  updateMessageStatus: async (messageId, status, isPrivate = false) => {
    const table = isPrivate ? 'messages' : 'chat_messages'
    const connection = await db.getConnection()
    try {
      await connection.execute(`UPDATE ${table} SET status = ? WHERE id = ?`, [
        status,
        messageId,
      ])
    } finally {
      connection.release()
    }
  },

  // 標記訊息為已讀
  markAsRead: async (messageIds, isPrivate = false) => {
    const table = isPrivate ? 'messages' : 'chat_messages'
    const connection = await db.getConnection()
    try {
      await connection.execute(
        `UPDATE ${table} 
         SET status = 'read', read_at = NOW() 
         WHERE id IN (?) AND status != 'read'`,
        [messageIds]
      )
    } finally {
      connection.release()
    }
  },

  // 獲取私人訊息記錄
  getPrivateMessages: async (userId1, userId2, limit = 50) => {
    const connection = await db.getConnection()
    try {
      const [messages] = await connection.execute(
        `SELECT m.*, 
         sender.name as sender_name, 
         sender.image_path as sender_image
         FROM messages m
         JOIN users sender ON m.sender_id = sender.user_id
         WHERE ((m.sender_id = ? AND m.receiver_id = ?) 
         OR (m.sender_id = ? AND m.receiver_id = ?))
         AND m.is_deleted = 0
         ORDER BY m.created_at DESC
         LIMIT ?`,
        [userId1, userId2, userId2, userId1, limit]
      )
      return messages
    } finally {
      connection.release()
    }
  },

  // 獲取群組訊息記錄
  getGroupMessages: async (roomId, limit = 50) => {
    const connection = await db.getConnection()
    try {
      const [messages] = await connection.execute(
        `SELECT cm.*, 
         u.name as sender_name, 
         u.image_path as sender_image
         FROM chat_messages cm
         JOIN users u ON cm.sender_id = u.user_id
         WHERE cm.room_id = ? 
         AND cm.is_deleted = 0
         ORDER BY cm.created_at ASC
         LIMIT ?`,
        [roomId, limit]
      )
      return messages
    } finally {
      connection.release()
    }
  },

  // 刪除訊息（軟刪除）
  deleteMessage: async (messageId, isPrivate = false) => {
    const table = isPrivate ? 'messages' : 'chat_messages'
    const connection = await db.getConnection()
    try {
      await connection.execute(
        `UPDATE ${table} SET is_deleted = 1 WHERE id = ?`,
        [messageId]
      )
    } finally {
      connection.release()
    }
  },
}

export default messageService
