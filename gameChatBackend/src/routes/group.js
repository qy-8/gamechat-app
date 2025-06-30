const express = require('express')
const router = express.Router()
const {
  getUserGroups,
  sendGroupInvitation,
  createGroup,
  leaveGroup,
  uploadGroupAvatar,
  createChannel,
  deleteChannel,
  getChannels,
  responseToGroupInvitation,
  getGroupDetails,
  searchGroupMembers,
  getPendingGroupInvitations,
  kickGroupMember,
  updateGroupInfo,
  disbandGroup
} = require('../controller/groupController')
const authMiddleware = require('../middlewares/authMiddleware')
const upload = require('../middlewares/upload')

/**
 * @swagger
 * /api/groups/:
 *   post:
 *     summary: "创建群组"
 *     description: "用户创建一个新的群组，群组创建者会自动加入群组。需要在 `Authorization` 里添加 Token"
 *     tags:
 *       - Group
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: "群组名称"
 *                 example: "游戏爱好者"
 *               description:
 *                 type: string
 *                 description: "群组简介"
 *                 example: "这是一个讨论独立游戏的群组"
 *     responses:
 *       200:
 *         description: "群组创建成功"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "群组创建成功"
 *                     data:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           description: "群组名称"
 *                           example: "游戏爱好者"
 *                         description:
 *                           type: string
 *                           description: "群组简介"
 *                           example: "这是一个讨论独立游戏的群组"
 *                         createdBy:
 *                            type: string
 *                            example: "65d7e1f2b9c1e1234d6a0000"
 *                         members:
 *                            type: array
 *                            items:
 *                              type: string
 *                              example: "65d7e1f2b9c1e1234d6a0000"
 *                   example:
 *                     status: "success"
 *                     message: "群组创建成功"
 *                     data:
 *                       name: "游戏爱好者"
 *                       description: "这是一个讨论独立游戏的群组"
 *                       createdBy: "65d7e1f2b9c1e1234d6a0000"
 *                       members:
 *                         - "64b7c9b5f1d2a4e0d6e8fbc9"
 *                         - "65d7e1f2b9c1e1234d6a0000"
 *                         - "65d7e1f2b9c1e1234d6a0001"
 *       400:
 *         description: "创建群组失败"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "创建群组失败"
 */

router.post('/', authMiddleware, createGroup)

/**
 * @swagger
 * /api/groups/mine:
 *   get:
 *     summary: "获取用户所属的群组所有用户"
 *     description: "获取用户所属的群组内所有用户的详细信息，包括用户名、头像。需要在 `Authorization` 里添加 Token"
 *     tags:
 *       - Group
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: "获取群组信息成功"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "获取群组信息成功"
 *                     data:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           description: "群组名称"
 *                           example: "游戏爱好者"
 *                         description:
 *                           type: string
 *                           description: "群组简介"
 *                           example: "这是一个讨论独立游戏的群组"
 *                         createdBy:
 *                           type: string
 *                           example: "65d7e1f2b9c1e1234d6a0000"
 *                         members:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 description: "用户ID（ObjectId）"
 *                                 example: "65d7e1f2b9c1e1234d6a0000"
 *                               avatar:
 *                                 type: string
 *                                 description: "用户头像"
 *                                 example: "https://example.com/avatar.jpg"
 *                   example:
 *                     status: "success"
 *                     message: "获取群组信息成功"
 *                     data:
 *                       name: "游戏爱好者"
 *                       description: "这是一个讨论独立游戏的群组"
 *                       createdBy: "65d7e1f2b9c1e1234d6a0000"
 *                       members:
 *                         - id: "64b7c9b5f1d2a4e0d6e8fbc9"
 *                           avatar: "https://example.com/avatar1.jpg"
 *                         - id: "65d7e1f2b9c1e1234d6a0000"
 *                           avatar: "https://example.com/avatar2.jpg"
 *                         - id: "65d7e1f2b9c1e1234d6a0001"
 *                           avatar: "https://example.com/avatar3.jpg"
 *       400:
 *         description: "请求错误，获取群组信息失败"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/ErrorResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "获取群组信息失败"
 */

router.get('/mine', authMiddleware, getUserGroups)

/**
 * @swagger
 * /api/groups/{groupId}/invitations:
 *   post:
 *     summary: 批量邀请用户加入群组
 *     description: 只有群主可以邀请用户加入群组。支持同时邀请多个用户。
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         description: 群组ID
 *         schema:
 *           type: string
 *           example: 60f5a3c2e4b0a51234567890
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteeIds
 *             properties:
 *               inviteeIds:
 *                 type: array
 *                 description: 被邀请的用户ID数组
 *                 items:
 *                   type: string
 *                 example: ["60f5a3c2e4b0a51234567891"]
 *     responses:
 *       200:
 *         description: 邀请成功
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
 *                   example: {}
 *                 message:
 *                   type: string
 *                   example: 邀请成功
 *       400:
 *         description: 请求错误，例如群组不存在、非群主邀请、用户已在群组中、或邀请自己
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 群组不存在/只有群主才能邀请用户/用户已在该群组中/不能邀请自己加入群组
 *       409:
 *         description: 存在重复邀请
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 已发送过邀请，请等待用户处理
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 发送群组邀请失败
 */

router.post('/:groupId/invitations', authMiddleware, sendGroupInvitation)

/**
 * @swagger
 * /api/groups/leave:
 *   delete:
 *     summary: "退出群组"
 *     description: "用户退出指定的群组。用户将从群组成员列表中移除。需要在 `Authorization` 里添加 Token"
 *     tags:
 *       - Group
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *             properties:
 *               groupId:
 *                 type: string
 *                 description: "群组id"
 *                 example: "63a6f8bde5bda2d43278e2c9"
 *     responses:
 *       200:
 *         description: "成功退出群组"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "您已退出该群组"
 *       400:
 *         description: "请求错误，例如用户不在该群组中"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "您不在该群组中/退出群组失败"
 */

router.delete('/leave', authMiddleware, leaveGroup)

/**
 * @swagger
 * /api/groups/:groupId/avatar:
 *   post:
 *     summary: "上传群组头像"
 *     description: "上传群组头像文件。需要添加 Token，以 multipart/form-data 方式上传头像。"
 *     tags:
 *       - Group
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: "要上传的群组头像文件"
 *     responses:
 *       200:
 *         description: "头像上传成功，返回头像 URL"
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
 *                         url:
 *                           type: string
 *                           example: "/uploads/group_avatar_123456.png"
 *                     message:
 *                       type: string
 *                       example: "群组头像上传成功"
 *       401:
 *         description: "上传失败（例如未上传文件）"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "群组头像上传失败"
 */

router.post('/:groupId/avatar', upload.single('avatar'), uploadGroupAvatar)

/**
 * @swagger
 * /api/groups/channel:
 *   post:
 *     summary: "创建频道"
 *     description: "在指定群组内创建一个新的频道。需要在 `Authorization` 里添加 Token"
 *     tags:
 *       - Group
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - groupId
 *             properties:
 *               name:
 *                 type: string
 *                 description: "频道名称"
 *                 example: "公告频道"
 *               groupId:
 *                 type: string
 *                 description: "群组id"
 *                 example: "63a6f8bde5bda2d43278e2c9"
 *     responses:
 *       200:
 *         description: "频道创建成功"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "频道创建成功"
 *       400:
 *         description: "请求错误，例如群组不存在"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "创建频道失败"
 */

router.post('/channel', authMiddleware, createChannel)

/**
 * @swagger
 * /api/groups/channel/{channelId}:
 *   delete:
 *     summary: "删除频道"
 *     description: "通过频道 ID 删除指定频道（逻辑删除，将频道状态设为 0）。需要添加 Token。"
 *     tags:
 *       - Group
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: channelId
 *         in: path
 *         required: true
 *         description: "要删除的频道ID"
 *         schema:
 *           type: string
 *           example: "662de0fd9b49e6b58c67d0aa"
 *     responses:
 *       200:
 *         description: "频道删除成功"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "频道删除成功"
 *                     data:
 *                       type: "null"
 *       404:
 *         description: "频道不存在"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/ErrorResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "频道不存在"
 *       500:
 *         description: "删除频道失败"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/ErrorResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "删除频道失败"
 */

router.delete('/channel/:channelId', authMiddleware, deleteChannel)

/**
 * @swagger
 * /api/groups/{groupId}/channels:
 *   get:
 *     summary: "获取群组的所有频道"
 *     description: "根据群组 ID 获取该群组下的所有频道。需要在请求头 `Authorization` 中携带 Token。"
 *     tags:
 *       - Channel
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: 群组的 ID
 *     responses:
 *       200:
 *         description: "获取频道成功"
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
 *                         $ref: "#/components/schemas/Channel"
 *                     message:
 *                       example: "获取频道成功"
 *       500:
 *         description: "获取频道失败"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/ErrorResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "获取频道失败"
 */

router.get('/channel/:groupId/channels', authMiddleware, getChannels)

/**
 * @swagger
 * /api/groups/{groupId}/invitations/response:
 *   post:
 *     summary: 响应群组邀请
 *     description: 用户可以通过此接口接受或拒绝群组邀请。需要身份验证。
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         description: 群组ID
 *         schema:
 *           type: string
 *           example: 60f5a3c2e4b0a51234567890
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [accept, decline]
 *                 description: 用户对群组邀请的响应
 *                 example: accept
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
 *                 data:
 *                   type: object
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: 已成功加入群组
 *       400:
 *         description: 无效操作
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 无效操作
 *       404:
 *         description: 群组不存在或邀请已失效
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 群组不存在 / 邀请已失效
 *       500:
 *         description: 操作失败（服务器错误）
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 操作失败
 */

router.post(
  '/:groupId/invitations/response',
  authMiddleware,
  responseToGroupInvitation
)

/**
 * @swagger
 * /api/groups/{groupId}:
 *   get:
 *     summary: 获取群组详情（成员列表）
 *     description: 获取指定群组的详细信息，包括所有成员。仅群组成员可查看。
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         description: 群组ID
 *         schema:
 *           type: string
 *           example: 60f5a3c2e4b0a51234567890
 *     responses:
 *       200:
 *         description: 获取成功，返回群组及其成员信息
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
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60f5a3c2e4b0a51234567890"
 *                     name:
 *                       type: string
 *                       example: "我的游戏组"
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60f5a3c2e4b0a51234567891"
 *                           username:
 *                             type: string
 *                             example: "player01"
 *                           avatar:
 *                             type: string
 *                             example: "/avatars/avatar01.png"
 *                 message:
 *                   type: string
 *                   example: 获取群组详情成功
 *       403:
 *         description: 当前用户不是群组成员，无法访问
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 你不是该群组成员，无权查看
 *       404:
 *         description: 群组不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 群组不存在
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 获取群组详情失败
 */

router.get('/:groupId', authMiddleware, getGroupDetails)

/**
 * @swagger
 * /api/groups/{groupId}/members:
 *   get:
 *     summary: 搜索群组成员
 *     description: 在指定群组中根据用户名搜索群组成员。仅群组成员可访问。支持分页。
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         description: 群组ID
 *         schema:
 *           type: string
 *           example: 60f5a3c2e4b0a51234567890
 *       - name: q
 *         in: query
 *         required: true
 *         description: 搜索关键字（匹配用户名）
 *         schema:
 *           type: string
 *           example: 小明
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
 *         description: 每页返回数量（默认为 20）
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: 成员搜索成功或无搜索词返回空列表
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
 *                   properties:
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 60f5a3c2e4b0a51234567891
 *                           username:
 *                             type: string
 *                             example: 小明
 *                           avatar:
 *                             type: string
 *                             example: /uploads/avatar1.png
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalMembers:
 *                       type: integer
 *                       example: 43
 *                 message:
 *                   type: string
 *                   example: 成员搜索成功
 *       400:
 *         description: 群组不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 当前用户不是群组成员
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.get('/:groupId/members', authMiddleware, searchGroupMembers)

/**
 * @swagger
 * /api/groups/invitations/pending:
 *   get:
 *     summary: 获取当前用户的待处理群组邀请
 *     description: 返回当前登录用户尚未响应的群组邀请信息，需要携带 Bearer Token。
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取待处理的邀请列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 data:
 *                   type: array
 *                   description: 待处理的邀请列表
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: 邀请记录的 ID
 *                         example: 662f0c9fd203d5a8b4f3a123
 *                       group:
 *                         type: object
 *                         description: 邀请所属的群组信息
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 663fae123fc6d803a8d38a77
 *                           name:
 *                             type: string
 *                             example: 狼人杀爱好者
 *                           avatar:
 *                             type: string
 *                             example: /uploads/group_avatar.png
 *                       inviter:
 *                         type: object
 *                         description: 邀请人信息
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 663fae123fc6d803a8d38a78
 *                           username:
 *                             type: string
 *                             example: Henry
 *                           avatar:
 *                             type: string
 *                             example: /uploads/user_avatar.jpg
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-06-08T12:34:56.789Z
 *                 message:
 *                   type: string
 *                   example: 获取待处理的群组邀请成功
 *       401:
 *         description: 未登录或 token 无效
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.get('/invitations/pending', authMiddleware, getPendingGroupInvitations)

/**
 * @swagger
 * /api/groups/{groupId}/members/{memberId}:
 *   delete:
 *     summary: 移除群组成员
 *     description: 群主可以将群组中的其他成员移出群组，不能移除自己。
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         description: 群组 ID
 *         schema:
 *           type: string
 *           example: 6640ab1234cf8a0012c88ef9
 *       - name: memberId
 *         in: path
 *         required: true
 *         description: 要移除的用户 ID
 *         schema:
 *           type: string
 *           example: 6640ab1234cf8a0012c88efa
 *     responses:
 *       200:
 *         description: 成员移除成功
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
 *                   example: {}
 *                 message:
 *                   type: string
 *                   example: 移除成功
 *       400:
 *         description: 请求无效（如尝试移除自己）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 没有权限
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 群组或用户未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.delete('/:groupId/members/:memberId', authMiddleware, kickGroupMember)

/**
 * @swagger
 * /api/groups/{groupId}/info:
 *   patch:
 *     summary: 修改群组信息（群名与群描述）
 *     description: 只有群主可以修改群组名称和描述，名称最长 10 个字符，描述最长 15 个字符。
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         description: 群组 ID
 *         schema:
 *           type: string
 *           example: 6650cabc1234567890abcdef
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 新的群组名称（最长 10 个字符）
 *                 example: 游戏开发组
 *               description:
 *                 type: string
 *                 description: 群组简介（最长 15 个字符）
 *                 example: 我们热爱 Indie Game
 *     responses:
 *       200:
 *         description: 群组信息修改成功或无变动
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
 *                   example: 群组信息更新成功
 *                 data:
 *                   $ref: '#/components/schemas/Group'
 *       400:
 *         description: 请求数据无效，如名称为空、超长等
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未提供有效身份信息
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 非群主无权操作
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 群组不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 群组名称已被占用
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.patch('/:groupId/info', authMiddleware, updateGroupInfo)

/**
 * @swagger
 * /api/groups/{groupId}:
 *   delete:
 *     summary: 解散群组
 *     description: 仅群主可以解散群组。该操作会移除所有成员的群组关联，并解绑该群组下所有频道。
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         description: 要解散的群组 ID
 *         schema:
 *           type: string
 *           example: 6650cabc1234567890abcdef
 *     responses:
 *       200:
 *         description: 群组成功解散
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
 *                   example: 群组已成功解散
 *                 data:
 *                   $ref: '#/components/schemas/Group'
 *       403:
 *         description: 非群主无权限解散群组
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 群组不存在
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

router.delete('/:groupId', authMiddleware, disbandGroup)

module.exports = router
