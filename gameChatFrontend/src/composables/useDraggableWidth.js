/**
 * @file useDraggableWidth.js
 * @description 一个 Vue 组合式函数 (Composable)，用于实现元素的水平拖拽改变宽度功能。
 * @function useDraggableWidth
 * @param {Ref<HTMLElement|VueComponent>} targetElementRef - 目标元素的 Vue 引用 (ref)，该引用应指向要拖拽改变宽度的 DOM 元素或 Vue 组件实例。
 * @param {object} [options={}] - 配置选项，用于自定义拖拽行为。
 * @param {number} [options.minWidth=200] - 元素拖拽的最小宽度（像素）。
 * @param {number} [options.maxWidth=500] - 元素拖拽的最大宽度（像素）。
 * @returns {{startDragging: Function}} 包含 `startDragging` 方法的对象，需要将此方法绑定到拖拽手柄的 `mousedown` 事件上。
 * @property {Function} startDragging - 启动拖拽操作的函数。通常绑定到拖拽手柄的 `mousedown` 事件。
 */
import { onUnmounted } from 'vue'

export function useDraggableWidth(targetElementRef, options = {}) {
  // 内部状态：标记当前是否正在拖拽
  let isDragging = false
  // 拖拽开始时鼠标的 X 坐标
  let startX = 0
  // 拖拽开始时目标元素的初始宽度
  let startWidth = 0

  // 解构配置选项，设置默认的最小和最大宽度
  const { minWidth = 200, maxWidth = 500 } = options

  /**
   * @function handleDragging
   * @description 内部函数：处理鼠标移动时的拖拽逻辑。
   * 该函数会在鼠标拖拽过程中持续被调用，计算并更新元素的宽度。
   * @private
   * @param {MouseEvent} e - 鼠标事件对象，提供了鼠标当前的客户端坐标。
   * @returns {void}
   */
  const handleDragging = (e) => {
    // 如果不在拖拽状态或者目标元素引用无效，则不执行任何操作
    if (!isDragging || !targetElementRef.value) return

    // 获取实际的 DOM 元素。如果 targetElementRef 指向一个 Vue 组件，则取其 $el 属性。
    const domElement = targetElementRef.value.$el || targetElementRef.value
    // 计算鼠标从拖拽开始点到当前位置的 X 轴位移
    const deltaX = e.clientX - startX
    // 计算新的宽度
    let newWidth = startWidth + deltaX

    // 将新宽度限制在 minWidth 和 maxWidth 之间
    newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth))
    // 应用计算后的新宽度到元素的 style 上
    domElement.style.width = newWidth + 'px'
  }

  /**
   * @function stopDragging
   * @description 内部函数：停止拖拽操作。
   * 当鼠标松开时调用此函数，移除全局的 `mousemove` 和 `mouseup` 事件监听器，以防止意外行为。
   * @private
   * @returns {void}
   */
  const stopDragging = () => {
    isDragging = false // 将拖拽状态设为 false
    // 移除事件监听器
    document.removeEventListener('mousemove', handleDragging)
    document.removeEventListener('mouseup', stopDragging)
  }

  /**
   * @function startDragging
   * @description 启动拖拽操作的公共函数。
   * 需要将此函数绑定到拖拽手柄（例如一个 resize bar）的 `mousedown` 事件上。
   * 它会记录拖拽的起始状态，并添加全局的鼠标事件监听器。
   * @param {MouseEvent} e - 鼠标事件对象，通常来自 `mousedown` 事件。
   * @returns {void}
   */
  const startDragging = (e) => {
    // 如果目标元素引用无效，则不执行任何操作
    if (!targetElementRef.value) return

    // 获取实际的 DOM 元素
    const domElement = targetElementRef.value.$el || targetElementRef.value
    // 记录拖拽开始时的鼠标 X 坐标
    startX = e.clientX
    // 记录拖拽开始时元素的当前宽度
    startWidth = domElement.offsetWidth
    // 设置拖拽状态为 true
    isDragging = true

    // 添加全局事件监听器来处理鼠标移动和释放事件
    document.addEventListener('mousemove', handleDragging)
    document.addEventListener('mouseup', stopDragging)
  }

  onUnmounted(() => {
    document.removeEventListener('mousemove', handleDragging)
    document.removeEventListener('mouseup', stopDragging)
  })

  return {
    startDragging
  }
}
