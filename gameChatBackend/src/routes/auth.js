const express = require('express')
const router = express.Router()
const { resetPassword } = require('../controller/passwordController')
const expressJoi = require('@escook/express-joi')
const { resetPasswordSchema } = require('../validators/userValidator')
const authMiddleware = require('../middlewares/authMiddleware')

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: "重设密码"
 *     description: "重设密码。需要在请求头 `Authorization` 中携带 Token。"
 *     tags:
 *       - Auth
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPwd
 *               - newPwd
 *             properties:
 *               oldPwd:
 *                 type: string
 *                 format: password
 *                 description: "旧密码"
 *                 example: "strongpassword123"
 *               newPwd:
 *                 type: string
 *                 format: password
 *                 description: "新密码"
 *                 example: "strongpassword123"
 *     responses:
 *       200:
 *         description: "密码重置成功"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "密码重置成功"
 *       400:
 *         description: "请求错误，包括用户不存在/旧密码不正确"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "用户不存在/旧密码不正确"
 */

router.post(
  '/reset-password',
  authMiddleware,
  expressJoi(resetPasswordSchema),
  resetPassword
)

module.exports = router
