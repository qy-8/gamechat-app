/**
 * @file utils/eventBus.js
 * @description 全局事件总线实例，基于 Mitt 库实现。
 * 用于在应用程序的不同组件之间进行简单的事件发布和订阅。
 * @module EventBus
 * @see {@link https://github.com/developit/mitt}
 */

import mitt from 'mitt'

/**
 * @constant {Emitter} emitter
 * @description 应用程序的全局事件总线实例。
 * @example
 * // 发布事件
 * import emitter from '@/utils/eventBus';
 * emitter.emit('user-loggedIn', { userId: 123 });
 *
 * // 订阅事件
 * import emitter from '@/utils/eventBus';
 * emitter.on('user-loggedIn', (payload) => {
 * console.log('User logged in:', payload.userId);
 * });
 */
const emitter = mitt()

export default emitter
