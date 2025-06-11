import { onUnmounted } from 'vue'

export function useDraggableWidth(targetElementRef, options = {}) {
  let isDragging = false
  let startX = 0
  let startWidth = 0

  // 获取最小和最大宽度，或者使用默认值
  const { minWidth = 200, maxWidth = 500 } = options

  const handleDragging = (e) => {
    if (!isDragging || !targetElementRef.value) return

    const domElement = targetElementRef.value.$el || targetElementRef.value
    const deltaX = e.clientX - startX
    let newWidth = startWidth + deltaX

    newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth))
    domElement.style.width = newWidth + 'px'
  }

  const stopDragging = () => {
    isDragging = false
    document.removeEventListener('mousemove', handleDragging)
    document.removeEventListener('mouseup', stopDragging)
  }

  const startDragging = (e) => {
    if (!targetElementRef.value) return

    const domElement = targetElementRef.value.$el || targetElementRef.value
    startX = e.clientX
    startWidth = domElement.offsetWidth
    isDragging = true

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
