import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import compression from 'vite-plugin-compression'
import imagemin from 'vite-plugin-imagemin'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    vue(),
    compression({
      ext: '.gz', // 压缩文件后缀，默认为 .gz
      algorithm: 'gzip', // 压缩算法，默认为 gzip
      threshold: 1024, // 只压缩大于此字节（1kb）的文件
      deleteOriginFile: false // 压缩后是否删除原文件（建议开发时设为 false，部署时根据需要决定）
    }),
    AutoImport({
      resolvers: [
        ElementPlusResolver(),
        // 自动导入图标组件
        IconsResolver({
          prefix: 'Icon'
        })
      ]
    }),
    Components({
      resolvers: [
        // 自动注册图标组件
        IconsResolver({
          prefix: 'Icon',
          enabledCollections: ['ep', 'mdi', 'ic']
        }),
        ElementPlusResolver({ importStyle: 'sass' })
      ]
    }),
    imagemin({
      // 自动化图片压缩
      gifsicle: { optimizationLevel: 7, interlaced: false },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 20 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [
          { name: 'removeViewBox' },
          { name: 'removeEmptyAttrs', active: false }
        ]
      }
    }),
    visualizer({ open: true }), // 打包后会自动在浏览器打开分析报告
    Icons({
      autoInstall: true
    })
  ],
  build: {
    // 配置 Rollup 手动分块，进一步优化通用库拆分
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将大的第三方库单独打包，利用浏览器缓存
          // 这些库会被分别打包成一个 chunk
          if (id.includes('node_modules')) {
            // Vue 和 Pinia 相关
            if (id.includes('vue') || id.includes('pinia')) {
              return 'vendor-vue-pinia'
            }
            // Element Plus UI 库
            if (id.includes('element-plus')) {
              return 'vendor-element-plus'
            }
            // HTTP 请求和 WebSocket 库
            if (id.includes('axios') || id.includes('socket.io-client')) {
              return 'vendor-network'
            }
            // 工具类库
            if (
              id.includes('dayjs') ||
              id.includes('lodash-es') ||
              id.includes('@vueuse/core')
            ) {
              return 'vendor-utils'
            }
            // Emoji 选择器 (如果它体积较大且不属于上述分类)
            if (
              id.includes('vue3-emoji-picker') ||
              id.includes('emoji-regex')
            ) {
              return 'vendor-emoji'
            }
            // Lottie 动画库 (如果它体积较大)
            if (id.includes('lottie-web')) {
              return 'vendor-lottie'
            }
            // 其他所有未明确分组的 node_modules 依赖，打包到这个 chunk
            return 'vendor-common'
          }
          // 非 node_modules 且不属于路由懒加载的，通常是 src/ 内部代码，它们会根据 Vue Router 的懒加载自动分割
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console
        drop_debugger: true // 移除 debugger
      }
    }
  }
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //       additionalData: '@use "@/assets/styles/variables.scss" as *;'
  //     }
  //   }
  // }
})
