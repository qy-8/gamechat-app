const express = require('express')
const router = express.Router()
const expressJoi = require('@escook/express-joi')
const authMiddleware = require('../middlewares/authMiddleware')
const upload = require('..//middlewares/upload')
const {
  register,
  sendSmsCodeToPhone,
  loginWithPhoneNumber,
  loginWithUsername
} = require('../handler/userHandler')
const {
  validatePhoneSchema,
  updateUserSchema,
  regSchema,
  loginWithPhoneSchema,
  loginWithUsernameSchema
} = require('../validators/userValidator')
const {
  getUserInfo,
  updateUserInfo,
  deleteUser,
  uploadAvatar
} = require('../controller/userController')

/**
 * @swagger
 * /api/auth/register/phone:
 *   post:
 *     summary: "发送短信验证码"
 *     description: "通过验证图形验证码，向用户手机号发送短信验证码"
 *     tags:
 *       - SMS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 description: "用户手机号"
 *                 example: "13800138000"
 *               captcha:
 *                 type: string
 *                 description: "图形验证码"
 *                 example: "abc12"
 *     responses:
 *       200:
 *         description: "短信验证码已成功发送"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "短信验证码已发送"
 *       400:
 *         description: "图形验证码错误"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/ErrorResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "图形验证码错误"
 *       500:
 *         description: "操作失败"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/ErrorResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "操作失败"
 */

router.post(
  '/register/phone',
  expressJoi(validatePhoneSchema),
  sendSmsCodeToPhone
)

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: "用户注册"
 *     description: "注册新用户，需提供手机号、短信验证码、用户名、密码"
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - code
 *               - username
 *               - password
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: "手机号码（中国格式）"
 *                 example: "13800138000"
 *               code:
 *                 type: string
 *                 description: "短信验证码"
 *                 example: "123456"
 *               username:
 *                 type: string
 *                 description: "用户名"
 *                 example: "gamer123"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: "密码"
 *                 example: "strongpassword123"
 *     responses:
 *       200:
 *         description: "注册成功"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "注册成功"
 *       400:
 *         description: "验证码无效或已过期"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/ErrorResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "验证码错误或者已过期"
 *       500:
 *         description: "服务器错误"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/ErrorResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "服务器错误"
 */

router.post('/register', expressJoi(regSchema), register)

/**
 * @swagger
 * /api/auth/login/phone:
 *   post:
 *     summary: "用户使用手机号登陆"
 *     description: "用户登陆，使用手机号和验证码或手机号和密码的方式登录"
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: "手机号码（中国格式）"
 *                 example: "13800138000"
 *               code:
 *                 type: string
 *                 description: "短信验证码（可选，必须和验证码二选一）"
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: "密码（可选，必须和验证码二选一）"
 *                 example: "strongpassword123"
 *     responses:
 *       200:
 *         description: "注册成功"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "登陆成功"
 *                     data:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                           description: "访问令牌"
 *                           example: "eyJhbGciOiJIUzI1NiIsInR..."
 *                   example:
 *                     status: "success"
 *                     message: "登陆成功"
 *                     data:
 *                       token: "eyJhbGciOiJIUzI1NiIsInR..."
 *       400:
 *         description: "请求错误，可能的错误包括用户不存在、验证码错误、密码错误、未提供密码或验证码"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/ErrorResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "用户不存在/验证码不正确/密码错误/请提供密码或验证码"
 *       500:
 *         description: "服务器错误"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/ErrorResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "操作失败"
 */

router.post('/login/phone', loginWithPhoneNumber)

/**
 * @swagger
 * /api/auth/login/username:
 *   post:
 *     summary: "用户使用用户名登陆"
 *     description: "用户登陆，使用用户名和密码的方式登录"
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: "用户名"
 *                 example: "gamer123"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: "密码"
 *                 example: "strongpassword123"
 *     responses:
 *       200:
 *         description: "登陆成功"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "登陆成功"
 *       400:
 *         description: "请求错误，可能的错误包括用户不存在、密码错误"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/ErrorResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "密码错误/用户名不存在"
 */

router.post('/login/username', loginWithUsername)

/**
 * @swagger
 * /api/auth/info:
 *   get:
 *     summary: "获取用户信息"
 *     description: "获取用户信息。需要在请求头 `Authorization` 里添加 Bearer Token"
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: "成功获取用户信息"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "64b7c9b5f1d2a4e0d6e8fbc9"
 *                         username:
 *                           type: string
 *                           example: "gamer111"
 *                         avatar:
 *                           type: string
 *                           example: "https://example.com/avatar.png"
 *                         phoneNumber:
 *                           type: string
 *                           example: "13800138000"
 *                         favoriteGames:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Game1", "Game2"]
 *                         groups:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Group1", "Group2"]
 *                     message:
 *                       example: "获取用户信息成功"
 *                   example:
 *                     status: "success"
 *                     message: "操作成功"
 *                     data:
 *                       _id: "64b7c9b5f1d2a4e0d6e8fbc9"
 *                       username: "gamer111"
 *                       avatar: "https://example.com/avatar.png"
 *                       phoneNumber: "13800138000"
 *                       favoriteGames: ["Game1", "Game2"]
 *                       groups: ["Group1", "Group2"]
 *       400:
 *         description: "请求错误，用户不存在"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/ErrorResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "用户不存在"
 */

router.get('/info', authMiddleware, getUserInfo)

/**
 * @swagger
 * /api/auth/update:
 *   put:
 *     summary: "更新用户信息"
 *     description: "更新用户个人信息，包括用户名,手机号码。需要在请求头 `Authorization` 中携带 Token。"
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - avatar
 *               - phoneNumber
 *             properties:
 *               username:
 *                 type: string
 *                 description: "用户名"
 *                 example: "gamer123"
 *               phoneNumber:
 *                 type: string
 *                 description: "手机号码（中国格式）"
 *                 example: "13800138000"
 *     responses:
 *       200:
 *         description: "用户信息更新成功"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "用户信息更新成功"
 *       400:
 *         description: "请求错误，用户不存在"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/ErrorResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "用户名不存在"
 */

router.put(
  '/update',
  authMiddleware,
  expressJoi(updateUserSchema),
  updateUserInfo
)

/**
 * @swagger
 * /api/auth/me/avatar:
 *   put:
 *     summary: "上传或更新用户头像"
 *     description: "用户上传头像图片，将图片上传至 OSS 并更新数据库中的头像地址。需要在请求头携带 Token。"
 *     tags:
 *       - User
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
 *                 description: 用户头像文件
 *     responses:
 *       200:
 *         description: "头像上传成功"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         avatarUrl:
 *                           type: string
 *                           example: "https://bucket.oss.x.com/avatar/x.png"
 *                     message:
 *                       example: "个人头像更新成功"
 *       400:
 *         description: "上传失败，缺少文件或 userId"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/ErrorResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "个人头像上传失败"
 *       404:
 *         description: "用户不存在"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/ErrorResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "用户不存在，头像信息未更新"
 *       500:
 *         description: "服务器内部错误"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/ErrorResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "服务器内部错误: 上传个人头像失败"
 */

router.put('/me/avatar', upload.single('avatar'), authMiddleware, uploadAvatar)

/**
 * @swagger
 * /api/auth/delete:
 *   delete:
 *     summary: "删除用户"
 *     description: "删除当前用户，将用户的 status 设置为 0。需要在请求头 `Authorization` 中携带 Token。"
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: "用户已删除（状态设置为 0）"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "用户已删除（状态设置为 0）"
 *       400:
 *         description: "请求错误，例如用户不存在"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/ErrorResponse"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "用户不存在"
 */

router.delete('/delete', authMiddleware, deleteUser)

module.exports = router
