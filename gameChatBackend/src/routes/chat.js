const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const {
  getOrCreateConversation,
  getUserConversations,
  sendMessage,
  getConversationMessages,
  markConversationAsRead
} = require('../controller/chatController')
const validateConversation = require('../middlewares/chatAuthMiddleware')

/**
 * @swagger
 * /api/chat/conversations:
 *   post:
 *     summary: "获取或创建会话"
 *     description: "根据当前用户和目标用户 ID 获取已有会话或创建新会话。需要在请求头中携带 Token。"
 *     tags:
 *       - Conversation
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 description: 对话目标用户的 ID
 *                 example: "6650262e6c6b8f0012f462b1"
 *     responses:
 *       200:
 *         description: "获取或创建会话成功"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: "#/components/schemas/Conversation"
 *                     message:
 *                       example: "会话创建成功"
 *       400:
 *         description: "请求参数错误（如缺少 targetUserId 或 targetUserId 与当前用户相同）"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       500:
 *         description: "服务器内部错误"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */

router.post('/conversations', authMiddleware, getOrCreateConversation)

/**
 * @swagger
 * /api/chat/conversations:
 *   get:
 *     summary: "获取当前用户的会话列表"
 *     description: "获取当前用户参与的所有会话信息，包含对方用户信息、最后一条消息、是否已读等。需要在请求头中携带 Token。"
 *     tags:
 *       - Conversation
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: "获取成功"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/UserConversation"
 *                     message:
 *                       example: "获取会话列表成功"
 *       500:
 *         description: "服务器内部错误"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */

router.get('/conversations', authMiddleware, getUserConversations)

/**
 * @swagger
 * /api/chat/conversations/{conversationId}/messages:
 *   post:
 *     summary: "发送消息"
 *     description: "在指定会话中发送一条消息。需要验证会话有效。需要在请求头中携带 Token。"
 *     tags:
 *       - Message
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         required: true
 *         description: "会话 ID"
 *         schema:
 *           type: string
 *           example: "665146bd8ef9e9f1f25c4b77"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - messageType
 *             properties:
 *               content:
 *                 type: string
 *                 description: "消息内容"
 *                 example: "你好，我是测试消息"
 *               messageType:
 *                 type: string
 *                 enum: [text, image, file, system]
 *                 description: "消息类型"
 *                 example: "text"
 *     responses:
 *       200:
 *         description: "消息发送成功"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: "#/components/schemas/Message"
 *                     message:
 *                       example: "消息发送成功"
 *       400:
 *         description: "请求数据无效"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       500:
 *         description: "服务器内部错误"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */

router.post(
  '/conversations/:conversationId/messages',
  authMiddleware,
  validateConversation,
  sendMessage
)

/**
 * @swagger
 * /api/chat/conversations/{conversationId}/messages:
 *   get:
 *     summary: "获取会话消息"
 *     description: "分页获取指定会话的消息列表（按创建时间倒序排列）。需要验证会话有效。需要在请求头中携带 Token。"
 *     tags:
 *       - Message
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         required: true
 *         description: "会话 ID"
 *         schema:
 *           type: string
 *           example: "665146bd8ef9e9f1f25c4b77"
 *       - name: page
 *         in: query
 *         required: false
 *         description: "页码（从 1 开始）"
 *         schema:
 *           type: integer
 *           default: 1
 *           example: 2
 *       - name: limit
 *         in: query
 *         required: false
 *         description: "每页消息数量"
 *         schema:
 *           type: integer
 *           default: 20
 *           example: 10
 *     responses:
 *       200:
 *         description: "成功获取会话消息"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         messages:
 *                           type: array
 *                           items:
 *                             allOf:
 *                               - $ref: '#/components/schemas/Message'
 *                               - type: object
 *                                 properties:
 *                                   isSentByMe:
 *                                     type: boolean
 *                                     description: "当前用户是否是发送者"
 *                                     example: true
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         totalMessages:
 *                           type: integer
 *                           example: 83
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                     message:
 *                       example: "会话消息获取成功"
 *       500:
 *         description: "服务器内部错误"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */

router.get(
  '/conversations/:conversationId/messages',
  authMiddleware,
  validateConversation,
  getConversationMessages
)

// 当用户打开 conversation，所有信息标记为已读
router.post(
  '/conversations/:conversationId/read',
  authMiddleware,
  validateConversation,
  markConversationAsRead
)

module.exports = router
