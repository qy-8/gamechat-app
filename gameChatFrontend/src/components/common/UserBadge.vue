<script setup>
/**
 * @file UserBadge.vue
 * @description 一个显示用户头像和名称的徽章组件，点击时可触发事件。
 * @component UserBadge
 * @property {string} avatar - 用户的头像 URL，默认为一个默认用户头像。
 * @property {string} username - 用户的名称，必填。
 * @property {number} size - 头像的尺寸（像素），默认为 40px。
 * @emits click - 当用户徽章被点击时触发，并传递原生事件对象。
 */
const props = defineProps({
  avatar: {
    type: String,
    default: '/images/defaultUserAvatar.png'
  },
  username: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 40 // 默认大小为 40px
  }
})

// 定义组件可以触发的事件
const emit = defineEmits(['click'])

/**
 * 处理徽章点击事件。
 * @param {Event} event - 原生点击事件对象。
 */
const handleClick = (event) => {
  emit('click', event)
}
</script>

<template>
  <div class="user-badge" @click="handleClick">
    <el-avatar :size="props.size" :src="props.avatar">
      {{ props.username?.charAt(0) }}
    </el-avatar>
    <span class="username">
      {{ props.username }}
    </span>
  </div>
</template>

<style scoped>
/*------------------------------------*\
 # 用户徽章容器样式
 # 描述：定义用户徽章的整体布局、交互和间距。
\*------------------------------------*/
.user-badge {
  height: 100%;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 4px;
  border-radius: 6px;
}

/*------------------------------------*\
 # 用户名文本样式
 # 描述：设置用户名的左侧间距、字体粗细和颜色。
\*------------------------------------*/
.username {
  margin-left: 12px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
</style>
