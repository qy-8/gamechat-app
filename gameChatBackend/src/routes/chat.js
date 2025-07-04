const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const {
  getOrCreateConversation,
  getUserConversations,
  sendMessage,
  getConversationMessages,
  markConversationAsRead,
  sendMessageInChannel,
  searchMessagesInConversation,
  toggleMuteConversation
} = require('../controller/chatController')
const validateConversation = require('../middlewares/chatAuthMiddleware')
const { uploadChatMessageImage } = require('../controller/uploadController')
const upload = require('../middlewares/upload')

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
 *     summary: "发送消息到私聊"
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

/**
 * @swagger
 * /api/chat/channels/{channelId}/messages:
 *   post:
 *     summary: 发送消息到频道
 *     description: 群组成员可以在指定频道发送消息，支持文本和其他类型消息。
 *     tags:
 *       - Message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: channelId
 *         in: path
 *         required: true
 *         description: 频道 ID
 *         schema:
 *           type: string
 *           example: 665ff812345678abcdef1234
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 消息内容
 *                 example: 这是我发的第一条消息！
 *               messageType:
 *                 type: string
 *                 description: 消息类型，如 text、image 等，默认为 text
 *                 example: text
 *     responses:
 *       200:
 *         description: 消息发送成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 data:
 *                   type: object
 *                   description: 已发送的消息信息
 *                 message:
 *                   type: string
 *                   example: 消息发送成功
 *       400:
 *         description: 消息内容为空
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 频道不存在或用户不在群组中
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器错误，消息发送失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post(
  '/channels/:channelId/messages',
  authMiddleware,
  sendMessageInChannel
)

/**
 * @swagger
 * /api/chat/image/{conversationId}:
 *   post:
 *     summary: 上传聊天图片
 *     description: 通过 multipart/form-data 上传聊天图片，需登录用户并提供 conversationId。文件字段名应为 `image`。
 *     tags:
 *       - Message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         required: true
 *         description: 会话 ID（私聊或频道）
 *         schema:
 *           type: string
 *           example: "665f0c6fc3123456789abcde"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 要上传的图片文件
 *     responses:
 *       200:
 *         description: 图片上传成功，返回消息对象
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: 图片上传成功
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: 图片未上传或参数无效
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 会话不存在或用户未加入会话
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 上传失败，服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post(
  '/image/:conversationId',
  authMiddleware,
  upload.single('image'),
  uploadChatMessageImage
)

/**
 * @swagger
 * /api/chat//conversations/{conversationId}/messages/search:
 *   get:
 *     summary: 搜索会话中的消息
 *     description: 根据关键词搜索指定会话中的聊天消息，支持分页。
 *     tags:
 *       - Message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         required: true
 *         description: 会话 ID
 *         schema:
 *           type: string
 *           example: "6650cabc1234567890abcdef"
 *       - name: q
 *         in: query
 *         required: true
 *         description: 搜索关键词
 *         schema:
 *           type: string
 *           example: "你好"
 *       - name: page
 *         in: query
 *         required: false
 *         description: 当前页码（默认为 1）
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: 每页数量（默认为 20）
 *         schema:
 *           type: integer
 *           example: 20
 *     responses:
 *       200:
 *         description: 搜索成功，返回符合条件的消息列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: 搜索成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     totalResults:
 *                       type: integer
 *                       example: 45
 *       400:
 *         description: 请求缺少搜索关键词
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 用户不是会话成员
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 会话不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.get(
  '/conversations/:conversationId/messages/search',
  authMiddleware,
  searchMessagesInConversation
)

/**
 * @swagger
 * /api/chat/conversations/{conversationId}/mute:
 *   post:
 *     summary: 设为免打扰 / 取消免打扰
 *     description: 设置或取消对指定会话的免打扰状态。
 *     tags:
 *       - Conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         required: true
 *         description: 会话 ID
 *         schema:
 *           type: string
 *           example: "6650cabc1234567890abcdef"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mute
 *             properties:
 *               mute:
 *                 type: boolean
 *                 description: 是否设为免打扰（true 为设为免打扰，false 为取消）
 *                 example: true
 *     responses:
 *       200:
 *         description: 操作成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: 会话已设为免打扰
 *                 data:
 *                   type: object
 *                   properties:
 *                     muted:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: 请求参数错误，例如 mute 字段不是布尔值或会话 ID 非法
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post(
  '/conversations/:conversationId/mute',
  authMiddleware,
  toggleMuteConversation
)

module.exports = router
