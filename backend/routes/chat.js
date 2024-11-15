import express from 'express'
import { chatController } from '../controllers/chatController.js'
import { checkAuth } from './auth.js'

const router = express.Router()

// 套用身份驗證中間件
router.use(checkAuth)

// 聊天室相關路由
router.get('/rooms', chatController.getRooms)
router.post('/rooms', chatController.createRoom)
router.get('/rooms/:roomId', chatController.getRoomDetail)
router.get('/rooms/:roomId/members', chatController.getRoomMembers)
router.post('/rooms/:roomId/join', chatController.joinRoom)
router.post('/rooms/:roomId/leave', chatController.leaveRoom)
router.get('/rooms/:roomId/messages', chatController.getRoomMessages)
router.post('/rooms/:roomId/messages', chatController.sendMessage)

// 群組相關路由
router.get('/user/groups', chatController.getUserGroups)
router.post('/groups', chatController.createGroupChatRoom)
router.get('/groups/:groupId/messages', chatController.getGroupMessages)
router.get('/groups/:groupId/members', chatController.getGroupMembers)
router.post('/groups/:groupId/join', chatController.joinGroup)
router.post('/groups/:groupId/leave', chatController.leaveGroup)

// 私人訊息相關路由
router.get('/messages/private', chatController.getPrivateMessages)
router.post('/messages/private', chatController.sendPrivateMessage)

// 聊天室管理
router.put('/rooms/:roomId', chatController.updateRoom)
router.delete('/rooms/:roomId', chatController.deleteRoom)

// 群組管理
router.put('/groups/:groupId', chatController.updateGroup)
router.delete('/groups/:groupId', chatController.deleteGroup)

export default router
