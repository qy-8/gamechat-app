<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible'])

const onSubmit = () => {
  // 告知父组件提交事件
}
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

.dialog-title {
  display: flex;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: large;
  // padding-left: 52px;
  padding-left: 28px;
}

.dialog-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 10px;
  width: 100%;
}

.dialog-footer .el-button:hover {
  background: var(--el-color-primary);
  border: var(--el-color-primary);
}

.dialog-footer:active {
  transform: scale(0.95);
  transition: transform 0.1s;
}
</style>
