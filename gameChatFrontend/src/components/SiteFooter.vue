<script setup>
/**
 * @file Footer.vue
 * @description 应用程序的通用页脚组件，包含多个信息分类和版权声明。
 * @component Footer
 */
</script>

<template>
  <footer class="site-container">
    <div class="footer-container">
      <div class="footer-section">
        <h3>关于我们</h3>
        <ul>
          <li>公司简介</li>
          <li>团队成员</li>
          <li>加入我们</li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>帮助中心</h3>
        <ul>
          <li>常见问题</li>
          <li>联系我们</li>
          <li>隐私政策</li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>热门讨论</h3>
        <ul>
          <li>游戏搭子</li>
          <li>Mod 创作</li>
          <li>开发交流</li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>资源中心</h3>
        <ul>
          <li>创作工具</li>
          <li>API接口</li>
          <li>支持文档</li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>最新动态</h3>
        <ul>
          <li>最新游戏</li>
          <li>Mod 推荐</li>
          <li>社区活动</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2025 GameChat. All rights reserved.</p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
/*------------------------------------*\
 # 站点容器样式
 # 描述：设置页脚的顶部外边距、内边距和顶部边框。
\*------------------------------------*/
.site-container {
  margin-top: 120px;
  padding: 60px 120px;
  border-top: 1px solid #595757;
}

/*------------------------------------*\
 # 页脚内容容器
 # 描述：定义页脚弹性布局，使其水平分散对齐。
\*------------------------------------*/
.site-container .footer-container {
  display: flex;
  justify-content: space-between;
}

/*------------------------------------*\
 # 页脚单一部分（Section）
 # 描述：设置每个页脚信息部分的宽度和文本对齐方式。
\*------------------------------------*/
.site-container .footer-container .footer-section {
  width: 150px;
  text-align: left;
}

/*------------------------------------*\
 # 页脚标题样式
 # 描述：设置每个页脚 section 标题的底部外边距、内边距、颜色和底部边框。
\*------------------------------------*/
.footer-section h3 {
  margin-bottom: 10px;
  padding-bottom: 6px;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-text-color-primary);
}

/*------------------------------------*\
 # 文本内容样式
 # 描述：设置页脚列表项的底部外边距和文本颜色。
\*------------------------------------*/
.footer-section ul li {
  margin-bottom: 6px;
  color: var(--el-text-color-secondary);
}

/*------------------------------------*\
 # 页脚底部版权信息样式
 # 描述：设置版权信息的内边距和文本颜色。
\*------------------------------------*/
.footer-bottom {
  padding: 10px;
  color: var(--el-text-color-primary);
}
</style>
