<script setup>
/**
 * @file BaseDialog.vue
 * @description 这是一个通用的基础对话框组件，封装了 Element Plus 的 ElDialog，并提供自定义内容和标题的插槽。
 * @component BaseDialog
 * @property {boolean} visible - 控制对话框的显示与隐藏。
 * @emits update:visible - 当对话框的可见状态改变时触发。
 */
const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible'])
</script>

<template>
  <el-dialog
    class="dialog"
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    center
    width="440px"
  >
    <template #header>
      <div class="dialog-title">
        <slot name="header">
          <div class="base-dialog-title">默认标题</div>
        </slot>
      </div>
    </template>

    <div class="dialog-content">
      <slot></slot>
    </div>

    <template #footer>
      <slot name="footer">
        <el-button type="primary"> 确认 </el-button>
      </slot>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
/*------------------------------------*\
 # 对话框表单样式
 # 描述：设置对话框内部表单的布局和对齐方式。
\*------------------------------------*/

.el-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

/*------------------------------------*\
 # 对话框标题样式
 # 描述：定义对话框头部的标题显示风格。
\*------------------------------------*/

.dialog-title {
  display: flex;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: large;
  padding-left: 28px;
}

/*------------------------------------*\
 # 对话框内容样式
 # 描述：设置对话框主体内容的布局和对齐方式。
\*------------------------------------*/

.dialog-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 10px;
  width: 100%;
}

/*------------------------------------*\
 # 对话框底部按钮样式
 # 描述：定义对话框底部按钮的悬停和点击效果。
\*------------------------------------*/

.dialog-footer .el-button:hover {
  background: var(--el-color-primary);
  border: var(--el-color-primary);
}

.dialog-footer:active {
  transform: scale(0.95);
  transition: transform 0.1s;
}
</style>
