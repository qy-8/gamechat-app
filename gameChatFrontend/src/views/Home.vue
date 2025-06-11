<script setup>
import NavBar from '@/components/NavBar.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import router from '../router'
import LottiePlayer from '../components/LottiePlayer.vue'

const registerClickAnimation = '/animations/register-hand.json'
</script>

<template>
  <div class="container">
    <!-- 导航栏 -->
    <NavBar class="nav-bar-fixed" />

    <!-- 首页Banner -->
    <div class="img-text-box">
      <div class="text-box">
        <h1 class="title">连接游戏创作者，与志同道合的好友交流！</h1>
        <p class="text">
          一个属于游戏人的聊天室！游戏创作者、Mod 制作者和玩家们的聚集地！
        </p>
        <el-button
          @click="$router.push('/auth')"
          size="large"
          color="var(--primary-text-color)"
          >加入我们</el-button
        >
      </div>
    </div>
    <!-- 特色功能 -->
    <div class="details-box">
      <div class="img-box"></div>
      <div class="text-box">
        <ul>
          <li>
            <h2>多样频道</h2>
            <p>
              加入感兴趣的频道，无论是双人冒险、合作闯关还是多人竞技，都能找到你的游戏伙伴。
            </p>
          </li>
          <li>
            <h2>催更互动</h2>
            <p>
              直接与游戏创作者或 Mod
              制作者互动，了解游戏最新动态，参与作品成长。
            </p>
          </li>
          <li>
            <h2>创意分享</h2>
            <p>
              探索社区创意，发现玩家自制的
              Mod、地图和游戏内容，一起为游戏注入更多乐趣。
            </p>
          </li>
        </ul>
      </div>
    </div>

    <!-- 点击注册区域 -->
    <div class="register-btn">
      <div class="register-wrapper" @click="$router.push('/auth')">
        <el-button>点击注册</el-button>
        <LottiePlayer
          :animationData="registerClickAnimation"
          :loop="true"
          class="register-click-animation"
        />
      </div>
    </div>

    <!-- 页脚 -->
    <SiteFooter />
  </div>
</template>

<style lang="scss" scoped>
// 固定导航栏
.nav-bar-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--el-bg-color-home-details-box-bgc);
}
/* 页面整体布局 */
.container {
  max-width: 1700px;
  margin: 0 auto;
}

/* 首页Banner区域 */
.img-text-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: 874px;
  margin-top: 60px;
  background-image: url('/images/background3.jpg');
  background-size: cover;
  background-position: center;
  color: var(--primary-text-color);
  text-align: left;
}

/* 首页背景上的文本盒 */
.text-box {
  margin: 50px 100px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.9); //突出文字
}

/* 按钮样式 */
.el-button {
  margin-top: 25px;
  padding: 20px 20px;
  color: var(--secondary-text-color);
  font-size: 20px;
}

/* 特色功能 - 详情区域 */
.details-box {
  margin-top: 120px;
  display: flex;
}

/* 详情区域 - 左侧图片 */
.details-box .img-box {
  margin-left: 50px;
  width: 880px;
  height: 600px;
  background-image: url(/images/background1.avif);
  background-size: cover;
  background-position: center;
  border-radius: 20px; /* 图片圆角以提升视觉效果 */
}

/* 详情区域 - 右侧文本盒 */
.details-box .text-box {
  margin-right: 50px;
  text-shadow: none;
  color: var(--el-text-color-primary);
}

// 详情区域 - 文本列表
.details-box .text-box ul {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 让详情区域文本均匀分布 */
  height: 100%;
}

/* 详情区域 - 文本内容 */
.details-box .text-box p {
  color: var(--el-text-color-regular);
}

/* 详情标题样式 */
.text-box li h2 {
  margin-bottom: 18px;
}

.text-box li {
  padding: 20px;
}

.text-box li:hover {
  background-color: var(--el-bg-color-home-details-box-bgc);
  border-radius: 20px;
}

.register-btn {
  display: flex;
  justify-content: center;
  margin-top: 60px;
}

.register-wrapper {
  position: relative;
  cursor: pointer;
}

.register-btn .el-button {
  padding: 26px 10px;
  background-color: var(--secondary-text-color);
  color: var(--primary-text-color);
  font-size: 30px;
  border-radius: 14px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
}

.register-btn .register-click-animation {
  position: absolute;
  top: 20%;
  left: 40%;
}
</style>
