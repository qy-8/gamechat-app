<script setup>
/**
 * @file views/Home.vue
 * @description 应用程序的首页视图组件。
 * 包含顶部导航栏、主视觉Banner、特色功能展示、注册入口及底部页脚。
 * 使用 Intersection Observer 控制 Lottie 动画的按需加载和显示。
 * @component HomePage
 */
import NavBar from '@/components/NavBar.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { ref, onMounted, onUnmounted, defineAsyncComponent } from 'vue'

/**
 * @const {AsyncComponent} LottiePlayer
 * @description 异步加载的 Lottie 动画播放器组件，仅当需要时才加载其代码。
 */
const LottiePlayer = defineAsyncComponent(
  () => import('../components/LottiePlayer.vue')
)

/**
 * @type {Ref<string>}
 * @description Lottie 动画的 JSON 文件路径，用于注册按钮区域的点击动画。
 */
const registerClickAnimation = '/animations/register-hand.json'
/**
 * @type {Ref<boolean>}
 * @description 控制 `LottiePlayer` 组件的显示与隐藏。
 */
const showLottiePlayer = ref(false)
/**
 * @type {Ref<HTMLElement|null>}
 * @description 对“点击注册”按钮区域的 DOM 引用，用于 Intersection Observer 观察其可见性。
 */
const registerBtnRef = ref(null)
/**
 * @type {IntersectionObserver|null}
 * @description Intersection Observer 实例，用于检测 `registerBtnRef` 进入视口。
 * @private
 */
let observer = null

/**
 * @lifecycle onMounted
 * @description 组件挂载后执行的逻辑。
 * 初始化 Intersection Observer，观察 `registerBtnRef` 元素。
 * 当 `registerBtnRef` 进入视口时，显示 Lottie 动画并停止观察。
 * @returns {void}
 */
onMounted(() => {
  // 当组件挂载后，如果注册按钮区域存在，则开始观察它
  if (registerBtnRef.value) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 如果注册按钮区域进入视口，则显示 Lottie 动画
            showLottiePlayer.value = true
            // 停止观察，避免重复触发，提高性能
            if (observer) {
              observer.unobserve(entry.target)
            }
          }
        })
      },
      { threshold: 0.1 } // 当目标元素的 10% 进入视口时，触发回调
    )
    // 开始观察目标元素
    observer.observe(registerBtnRef.value)
  }
})

/**
 * @lifecycle onUnmounted
 * @description 组件卸载前执行的逻辑。
 * 断开 Intersection Observer 的连接，防止内存泄漏。
 * @returns {void}
 */
onUnmounted(() => {
  // 组件卸载时，停止所有观察，清理资源
  if (observer) {
    observer.disconnect()
  }
})
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
          @click="$router.push('/auth/register')"
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
    <div class="register-btn" ref="registerBtnRef">
      <div class="register-wrapper" @click="$router.push('/auth/register')">
        <el-button>点击注册</el-button>
        <LottiePlayer
          v-if="showLottiePlayer"
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
/*------------------------------------*\
 # 固定导航栏样式
 # 描述：设置导航栏为固定定位，确保其在页面顶部的显示层级和背景色。
\*------------------------------------*/
.nav-bar-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--el-bg-color-home-details-box-bgc);
}

/*------------------------------------*\
 # 页面整体容器
 # 描述：设置页面内容的最大宽度并居中，提供整体布局约束。
\*------------------------------------*/
.container {
  max-width: 1700px;
  margin: 0 auto;
}

/*------------------------------------*\
 # 首页Banner区域
 # 描述：定义主视觉Banner的高度、背景图、对齐方式和顶部外边距。
\*------------------------------------*/
.img-text-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: 874px;
  margin-top: 60px;
  background-image: url('/images/bannerBackground.jpg');
  background-size: cover;
  background-position: center;
  color: var(--primary-text-color);
  text-align: left;
}

/*------------------------------------*\
 # Banner区域文本框
 # 描述：设置Banner上文本内容的内外边距和文本阴影。
\*------------------------------------*/
.text-box {
  margin: 50px 100px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.9);
}

/*------------------------------------*\
 # ElButton通用样式
 # 描述：自定义 Element Plus 按钮的内边距、字体大小和文本颜色。
\*------------------------------------*/
.el-button {
  margin-top: 25px;
  padding: 20px 20px;
  color: var(--secondary-text-color);
  font-size: 20px;
}

/*------------------------------------*\
 # 特色功能详情区域
 # 描述：定义特色功能部分的顶部外边距和弹性布局。
\*------------------------------------*/
.details-box {
  margin-top: 120px;
  display: flex;
}

/*------------------------------------*\
 # 详情区域左侧图片框
 # 描述：设置特色功能部分的图片框尺寸、背景图、位置和圆角。
\*------------------------------------*/
.details-box .img-box {
  margin-left: 50px;
  width: 880px;
  height: 600px;
  background-image: url(/images/detailsBackground.avif);
  background-size: cover;
  background-position: center;
  border-radius: 20px; /* 图片圆角以提升视觉效果 */
}

/*------------------------------------*\
 # 详情区域右侧文本框
 # 描述：设置特色功能文本内容的内外边距、文本阴影和颜色。
\*------------------------------------*/
.details-box .text-box {
  margin-right: 50px;
  text-shadow: none; /* 移除文本阴影 */
  color: var(--el-text-color-primary); /* 使用主题主文本颜色 */
}

/*------------------------------------*\
 # 详情区域文本列表
 # 描述：定义特色功能文本列表的垂直布局和内容分布。
\*------------------------------------*/
.details-box .text-box ul {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 让详情区域文本均匀分布 */
  height: 100%;
}

/*------------------------------------*\
 # 详情区域文本段落
 # 描述：设置特色功能段落文本的颜色。
\*------------------------------------*/
.details-box .text-box p {
  color: var(--el-text-color-regular); /* 使用主题常规文本颜色 */
}

/*------------------------------------*\
 # 详情标题样式
 # 描述：设置特色功能标题的底部外边距。
\*------------------------------------*/
.text-box li h2 {
  margin-bottom: 18px;
}

/*------------------------------------*\
 # 详情列表项内边距
 # 描述：设置特色功能列表中每个项目卡片的内边距。
\*------------------------------------*/
.text-box li {
  padding: 20px;
}

/*------------------------------------*\
 # 详情列表项悬停效果
 # 描述：定义特色功能列表中每个项目卡片在鼠标悬停时的背景色和圆角。
\*------------------------------------*/
.text-box li:hover {
  background-color: var(--el-bg-color-home-details-box-bgc);
  border-radius: 20px;
}

/*------------------------------------*\
 # 注册按钮外层容器
 # 描述：居中显示“点击注册”按钮区域。
\*------------------------------------*/
.register-btn {
  display: flex;
  justify-content: center;
  margin-top: 60px;
}

/*------------------------------------*\
 # 注册按钮内容包裹器
 # 描述：定义“点击注册”按钮内部内容的相对定位和鼠标样式。
\*------------------------------------*/
.register-wrapper {
  position: relative;
  cursor: pointer;
}

/*------------------------------------*\
 # “点击注册”按钮样式
 # 描述：自定义“点击注册”按钮的内边距、背景色、字体大小、圆角和阴影。
\*------------------------------------*/
.register-btn .el-button {
  padding: 26px 10px;
  background-color: var(--secondary-text-color);
  color: var(--primary-text-color);
  font-size: 30px;
  border-radius: 14px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
}

/*------------------------------------*\
 # “点击注册”按钮悬停效果
 # 描述：定义“点击注册”按钮在鼠标悬停时移除边框。
\*------------------------------------*/
.register-btn .el-button:hover {
  border: none;
}

/*------------------------------------*\
 # 注册点击动画（Lottie）
 # 描述：定位 Lottie 动画在注册按钮区域内的位置。
\*------------------------------------*/
.register-btn .register-click-animation {
  position: absolute;
  top: 20%;
  left: 40%;
}
</style>
