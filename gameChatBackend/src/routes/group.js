const express = require('express')
const router = express.Router()
const {
  getUserGroups,
  inviteUserToGroup,
  createGroup,
  leaveGroup,
  uploadGroupAvatar,
  createChannel,
  deleteChannel,
  getChannels
} = require('../controller/groupController')
const authMiddleware = require('../middlewares/authMiddleware')
const upload = require('..//middlewares/upload')

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
 * /api/groups/members:
 *   post:
 *     summary: "邀请用户参加群组"
 *     description: "邀请用户参加群组。需要在 `Authorization` 里添加 Token"
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
 *               - userId
 *             properties:
 *               groupId:
 *                 type: string
 *                 description: "群组id"
 *                 example: "63a6f8bde5bda2d43278e2c9"
 *               userId:
 *                 type: string
 *                 description: "用户id"
 *                 example: "63a6f8bde5bda2d43278e2c8"
 *     responses:
 *       200:
 *         description: "邀请成功"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "邀请成功"
 *       400:
 *         description: "请求错误，例如群组不存在或用户已在群组中，或者非群主用户发起邀请"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "群组不存在/用户已在该群组中/只有群主才能邀请用户/邀请用户加入群组失败"
 */

router.post('/members', authMiddleware, inviteUserToGroup)

/**
 * @swagger
 * /api/groups/leave:
 *   post:
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

router.post('/leave', authMiddleware, leaveGroup)
// 待改，不应该是post，应该是delete

/**
 * @swagger
 * /api/group/avatar:
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

router.post('/avatar', upload.single('avatar'), uploadGroupAvatar)

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

// 获取所有频道
router.get('/channel/:groupId/channels', authMiddleware, getChannels)

module.exports = router
