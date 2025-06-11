const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const {
  sendFriendRequest,
  getIncomingRequest,
  handleFriendRequest,
  getFriendList,
  deleteFriend,
  updateFriendshipStatus,
  searchFriend,
  getBlockedList
} = require('../controller/friendController')

/**
 * @swagger
 * /api/friends:
 *   get:
 *     summary: "获取好友列表"
 *     description: "获取当前用户的所有好友信息（username、avatar、_id），已排除自己。需要在请求头中携带 Token。"
 *     tags:
 *       - Friends
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: "获取好友列表成功"
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
 *                         $ref: "#/components/schemas/FriendUser"
 *                     message:
 *                       example: "获取好友列表成功"
 *       401:
 *         description: "未授权，缺少或无效的 Token"
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

router.get('/', authMiddleware, getFriendList)

/**
 * @swagger
 * /api/friends/{friendId}:
 *   delete:
 *     summary: 删除好友
 *     description: 当前登录用户删除指定好友（软删除，修改状态）。需要在请求头中携带 Token。.
 *     tags:
 *       - Friends
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *         description: 好友用户的ID
 *     responses:
 *       200:
 *         description: 好友删除成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: string
 *                       example: "好友删除成功"
 *                     message:
 *                       type: string
 *                       example: "好友删除成功"
 *       400:
 *         description: 请求参数错误（如未提供好友ID或试图删除自己）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 好友关系不存在或已删除
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

router.delete('/:friendId', authMiddleware, deleteFriend)

/**
 * @swagger
 * /api/friends/{friendId}/status:
 *   put:
 *     summary: 更新好友关系状态（拉黑或取消拉黑）
 *     description: 当前登录用户对指定好友执行拉黑或取消拉黑操作。拉黑陌生人时会自动创建拉黑关系。需要在请求头中携带 Token。
 *     tags:
 *       - Friends
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *         description: 目标用户的ID
 *     requestBody:
 *       description: 状态更新信息
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [friends, blocked]
 *                 description: 好友状态，"blocked"表示拉黑，"friends"表示恢复好友状态
 *     responses:
 *       200:
 *         description: 操作成功，返回更新后的好友关系对象
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Friendship'
 *                     message:
 *                       type: string
 *                       example: "已将该用户拉黑或已经将该用户拉出黑名单"
 *       400:
 *         description: 请求参数错误（如未提供目标用户ID，或status无效）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限错误（如没有拉黑对方或该用户未被拉黑）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 未找到对应的好友关系（拉黑时自动创建除外）
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

router.put('/:friendId/status', authMiddleware, updateFriendshipStatus)

/**
 * @swagger
 * /api/friends/search:
 *   get:
 *     summary: 搜索好友（根据用户名精确匹配）
 *     description: 根据用户名精准搜索陌生人，搜索结果不包含当前登录用户。返回匹配的用户列表。需要在请求头中携带 Token。
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []  # 如果你用的是 Bearer Token 鉴权
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: 要搜索的用户名关键词，支持全词匹配（不区分大小写）
 *     responses:
 *       200:
 *         description: 搜索成功，返回用户列表
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
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: 用户ID
 *                       username:
 *                         type: string
 *                         description: 用户名
 *                       avatar:
 *                         type: string
 *                         description: 头像URL
 *                 message:
 *                   type: string
 *                   example: 搜索成功
 *       400:
 *         description: 请求参数无效
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
 *                   example: 请提供有效的关键词
 *       500:
 *         description: 搜索失败，服务器错误
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
 *                   example: 搜索失败
 */
router.get('/search', authMiddleware, searchFriend)

/**
 * @swagger
 * /api/friends/requests:
 *   post:
 *     summary: 发送好友请求
 *     description: 当前登录用户向目标用户发送好友请求。需要在请求头中携带 Token。
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: 目标用户的ID
 *     responses:
 *       200:
 *         description: 申请成功，返回好友请求对象
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
 *                       description: 关系ID
 *                     requester:
 *                       type: string
 *                       description: 请求者ID
 *                     recipient:
 *                       type: string
 *                       description: 接收者ID
 *                     status:
 *                       type: string
 *                       description: 状态，pending表示等待验证
 *                 message:
 *                   type: string
 *                   example: 申请成功
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 发送好友请求失败
 *       404:
 *         description: 目标用户不存在
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 该用户不存在
 *       409:
 *         description: 已存在冲突的好友关系
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 你们已经是好友了
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 发送好友请求失败
 */

router.post('/requests', authMiddleware, sendFriendRequest)
/**
 * @swagger
 * /api/friends/requests/{requestId}:
 *   put:
 *     summary: 处理好友请求（接受或拒绝）
 *     description: 当前登录用户对收到的好友请求进行接受或拒绝操作。需要在请求头中携带 Token。
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         description: 好友请求ID
 *         schema:
 *           type: string
 *     requestBody:
 *       description: 操作动作，accept表示接受，decline表示拒绝
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
 *                 description: 处理动作
 *     responses:
 *       200:
 *         description: 操作成功，返回更新后的好友请求对象
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
 *                       description: 好友请求ID
 *                     requester:
 *                       type: string
 *                       description: 请求者ID
 *                     recipient:
 *                       type: string
 *                       description: 接收者ID
 *                     status:
 *                       type: string
 *                       description: 当前状态，如 friends 或 declined
 *                     acceptedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 接受时间，若接受请求
 *                 message:
 *                   type: string
 *                   example: 操作成功
 *       400:
 *         description: 参数无效
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 操作无效
 *       403:
 *         description: 无权限处理该请求
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 该用户无权限处理此请求
 *       404:
 *         description: 好友请求不存在
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 好友请求不存在
 *       409:
 *         description: 请求已被处理
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 此请求被处理过
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 操作失败
 */

router.put('/requests/:requestId', authMiddleware, handleFriendRequest)

/**
 * @swagger
 * /api/friends/requests/incoming:
 *   get:
 *     summary: 获取收到的好友请求列表
 *     description: 返回当前登录用户所有待处理的好友请求（收到的请求）。需要在请求头中携带 Token。
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 好友请求列表获取成功
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
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: 好友请求ID
 *                       requester:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: 请求者ID
 *                           username:
 *                             type: string
 *                             description: 请求者用户名
 *                           avatar:
 *                             type: string
 *                             description: 请求者头像URL
 *                       recipient:
 *                         type: string
 *                         description: 接收者ID（当前用户）
 *                       status:
 *                         type: string
 *                         description: 请求状态（pending）
 *                       requestedAt:
 *                         type: string
 *                         format: date-time
 *                         description: 请求时间（如果有）
 *                 message:
 *                   type: string
 *                   example: 获取成功
 *       500:
 *         description: 服务器错误，获取失败
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 获取好友请求失败
 */

router.get('/requests/incoming', authMiddleware, getIncomingRequest)

/**
 * @swagger
 * /api/friends/blackList:
 *   get:
 *     summary: 获取黑名单列表
 *     description: 返回当前用户拉黑的所有用户信息
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 黑名单获取成功
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
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: 用户ID
 *                       username:
 *                         type: string
 *                         description: 用户名
 *                       avatar:
 *                         type: string
 *                         description: 用户头像URL
 *                 message:
 *                   type: string
 *                   example: 获取成功
 *       500:
 *         description: 服务器错误，获取失败
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: 获取黑名单列表失败
 */

router.get('/blackList', authMiddleware, getBlockedList)

module.exports = router
