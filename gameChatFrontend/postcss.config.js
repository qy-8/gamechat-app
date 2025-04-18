export default {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 16, // 1rem = 16px
      propList: ['*'], // 作用于所有 CSS 属性
      unitPrecision: 5, // 计算 rem 保留 5 位小数
      replace: true, // 替换 px，而不是添加备用单位
      mediaQuery: false, // 不转换媒体查询中的 px
      minPixelValue: 1 // 只有大于 1px 的值才会转换
    }
  }
}
