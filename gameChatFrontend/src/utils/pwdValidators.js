/**
 * @file utils/pwdValidators.js
 * @description 包含用于密码验证的工具函数。
 * @module PasswordValidators
 */

/**
 * @function createConfirmPasswordValidator
 * @description 创建一个 Element Plus 表单验证器，用于对比密码和确认密码是否一致。
 * 这个验证器是一个高阶函数，返回一个标准的 Element Plus 校验函数。
 * @param {Function} getPasswordToCompare - 一个函数，调用时返回主密码（需要与确认密码进行对比的密码）。
 * @param {string} [emptyMessage='请再次输入密码'] - 确认密码为空时的错误消息。
 * @param {string} [mismatchMessage='两次输入的密码不一致'] - 两次密码不一致时的错误消息。
 * @returns {Function} 返回一个 Element Plus 兼容的验证函数 `(rule, value, callback)`。
 * @example
 * // 在 Element Plus 表单规则中使用
 * import { createConfirmPasswordValidator } from '@/utils/pwdValidators';
 * const resetPwdForm = reactive({ newPwd: '', confirmPwd: '' });
 * const rules = {
 * confirmPwd: [
 * { validator: createConfirmPasswordValidator(() => resetPwdForm.newPwd), trigger: 'blur' }
 * ]
 * };
 */
export const createConfirmPasswordValidator = (
  getPasswordToCompare,
  emptyMessage = '请再次输入密码',
  mismatchMessage = '两次输入的密码不一致'
) => {
  /**
   * @inner
   * @description 内部验证函数，作为 Element Plus 表单规则的 `validator` 使用。
   * @param {object} rule - 当前的校验规则对象。
   * @param {string} value - 确认密码输入框的值。
   * @param {Function} callback - 校验完成时必须调用的回调函数。
   * @returns {void}
   */
  return (rule, value, callback) => {
    const passwordToCompare = getPasswordToCompare() // 获取要对比的密码值

    if (!value) {
      // 确认密码为空
      callback(new Error(emptyMessage))
    } else if (value !== passwordToCompare) {
      // 确认密码与主密码不一致
      callback(new Error(mismatchMessage))
    } else {
      // 密码一致，校验通过
      callback()
    }
  }
}
