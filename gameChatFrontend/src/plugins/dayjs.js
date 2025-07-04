/**
 * @file dayjs.config.js
 * @description 配置 Day.js 库，包括相对时间插件、中文语言包和自定义相对时间文本。
 * @module DayjsConfig
 */

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime' // 导入相对时间插件
import 'dayjs/locale/zh-cn' // 导入中文语言包
import updateLocale from 'dayjs/plugin/updateLocale' // 导入更新本地化配置插件

// 扩展 Day.js 以使用相对时间功能
dayjs.extend(relativeTime)
// 扩展 Day.js 以更新本地化配置
dayjs.extend(updateLocale)

// 设置 Day.js 的全局语言为中文
dayjs.locale('zh-cn')

// 自定义中文相对时间显示文本
dayjs.updateLocale('zh-cn', {
  relativeTime: {
    future: '%s内',
    past: '%s前',
    s: '刚刚',
    m: '1 分钟',
    mm: '%d 分钟',
    h: '1 小时',
    hh: '%d 小时',
    d: '1 天',
    dd: '%d 天',
    M: '1 个月',
    MM: '%d 个月',
    y: '1 年',
    yy: '%d 年'
  }
})
