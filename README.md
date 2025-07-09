# 🎮 GameChat - 为游戏玩家打造的实时聊天应用

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=for-the-badge&logo=vue.js)
![Node.js](https://img.shields.io/badge/Node.js-18.x-5FA04E?style=for-the-badge&logo=nodedotjs)
![Socket.IO](https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socketdotio)
![MongoDB](https://img.shields.io/badge/MongoDB-4.x-47A248?style=for-the-badge&logo=mongodb)
![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=for-the-badge&logo=redis)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

**[查看在线 API 文档 (Swagger)](https://qy-8.github.io/gamechat-app/api/) | [查看代码实现文档 (JSDoc)](https://qy-8.github.io/gamechat-app/code/)**

---

`GameChat` 是一个为游戏生态量身打造的全栈实时聊天应用。它旨在打破传统壁垒，为游戏开发者、Mod 创作者和广大玩家之间建立一个专属的交流渠道。在这里，创作者可以第一时间发布更新、收集用户即时反馈；玩家则能直接与他们喜爱的作品背后的团队互动，共同构建一个充满活力的游戏社区。本项目使用现代化的技术栈（Vue 3, Node.js, Socket.IO, MongoDB）构建，旨在提供一个高性能、功能丰富且用户体验流畅的交流平台。

这个项目不仅实现了核心的聊天功能，还深度整合了前端工程化的最佳实践，包括代码规范、自动化检查、性能优化和专业的文档管理。

![项目截图](https://github.com/qy-8/gamechat-app/blob/main/assets/gameChat_core.gif?raw=true)
*<p align="center">此为核心功能与黑暗/光明模式切换的GIF动图，更多功能展示请点击下方“更多演示”链接</p>*

<p align="center">
  <a href="#-核心特性-core-features">核心特性</a> •
  <a href="https://github.com/qy-8/gamechat-app?tab=readme-ov-file#%EF%B8%8F-%E6%8A%80%E6%9C%AF%E6%A0%88-tech-stack">技术栈</a> •
  <a href="#-功能模块-functional-modules">功能模块</a> •
  <a href="#-快速开始-quick-start">快速开始</a> •
  <a href="#-更多功能演示-more-demos">更多功能演示</a> •
  <a href="https://github.com/qy-8/gamechat-app?tab=readme-ov-file#-%E7%9B%AE%E5%BD%95%E7%BB%93%E6%9E%84simplified">目录结构</a>
</p>

## ✨ 核心特性 (Core Features)

- **💬 全栈实时通信**: 基于 **WebSocket** (`Socket.IO`) 实现低延迟的私聊和群聊频道消息传递。支持文本、表情符号、图片上传（集成阿里云 OSS）、引用回复以及 `@` 提及成员等现代聊天功能。
- **🎨 现代化的前端体验**: 采用 **Vue 3 (Composition API)** 构建，结合 **Element Plus** 实现**响应式 UI**，并完美适配**深色/光明双主题**。通过封装**通用业务组件**（如头像、对话框）和 **Axios 二次封装**（统一错误处理与 Loading），确保了代码的可复用性和交互一致性。
- **⚙️ 模块化分层架构**: 后端采用清晰的 **MVC + Service** 结构，通过**中间件 (Middleware)** 处理 JWT 认证、业务权限校验与文件上传；前端使用 **Pinia** 按场景组织状态。所有 API 均遵循 **RESTful** 设计原则，确保了项目的高可维护性与可扩展性。
- **🛠️ 自动化工程流程**: 集成 **Vite**, **ESLint**, **Prettier**, **Stylelint**, **Husky** 及 **Commitlint**，实现了从代码规范、自动格式化到**提交前检查**的完整自动化工作流。并通过**路由懒加载**、**Gzip 压缩**、**`manualChunks`分包**、**Rollup Visualizer**，以及静态图片资源压缩等策略进行了深入的**性能优化**。

- **📋 专业的文档化**: 后端使用 `swagger-jsdoc` 扫描符合 JSDoc 规范的 API 注释，自动生成并托管了可交互的 **Swagger** 在线文档。前端对核心函数采用 **JSDoc** 进行类型和功能注解；对 Vue 组件和 SCSS 样式采用**块级注释**和**标准化注释**，极大地提升了代码的可读性和可维护性。

## 🛠️ 技术栈 (Tech Stack)

| 类别             | 技术                                                                                                                                              |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| **前端**         | `Vue 3` (Composition API), `Vue Router`, `Pinia`, `Element Plus`, `Socket.IO Client`, `Axios`, `Sass/SCSS`, `day.js`, `lodash-es`, `@vueuse/core` |
| **后端**         | `Node.js`, `Express`, `Socket.IO`, `Mongoose`, `JWT`, `bcrypt.js`, `Aliyun OSS SDK`                                                               |
| **数据库**       | `MongoDB`, `Redis`                                                                                                                                |
| **构建与工程化** | `Vite`, `ESLint`, `Prettier`, `Stylelint`, `Husky`, `lint-staged`, `Commitlint`                                                                   |
| **文档**         | `JSDoc`, `Swagger (OpenAPI 3.0)`                                                                                                                  |

---

## 📦 功能模块 (Functional Modules)

### 🧑‍💻 用户与认证模块

- **注册/登录**: 支持手机号与验证码注册，保障账户安全。
- **JWT 身份认证与状态保持**: 用户登录后签发 JWT，后续请求通过 Token 认证，并利用`pinia-plugin-persistedstate`在刷新后保持登录状态。
- **个人资料**: 支持查看与修改个人信息（用户名、手机号码、密码等）。
- **头像管理**: 集成阿里云 OSS，支持头像上传、更换与展示。
- **会话管理**: 提供安全的退出登录功能。
- **账户安全**: 提供修改密码与注销账户功能。

### 👨‍👩‍👧‍👦 好友与群组模块 (<a href="#-friend--group-management">查看群组演示</a>)

- **好友管理**: 实现搜索用户、发送好友请求、处理请求（同意/拒绝）、拉黑好友、删除好友、好友列表以及黑名单列表展示。
- **群组创建与管理**: 支持创建新群组、解散群组、修改群组信息及更换群组头像。
- **成员邀请与管理**: 实现搜索群组成员、邀请好友加入群组、处理群组邀请及管理群组成员（踢出）。

### #️⃣ 频道模块

- **频道管理**: 支持在群组内创建和删除频道。
- **频道导航**: 实现群组内不同频道间的无缝切换。

### 💬 实时聊天与交互模块 

- **核心通信**: 基于 WebSocket 实现低延迟的私聊与群聊频道消息收发。
- **历史记录**: 实现消息历史记录的无限滚动分页加载 (Infinite Scrolling)。
- **Emoji 表情**: 支持表情选择与发送。
- **图片消息**: 实现图片上传（集成阿里云 OSS）、发送与懒加载。
- **引用回复**: 支持引用并回复指定消息。
- **@提及**: 支持在群聊中`@`特定成员并发送强提醒。

### 🔔 通知与个性化模块 (<a href="#-intelligent-notifications--theming">查看通知演示</a>)

- **多维通知系统**: 实现新好友/群组邀请、新消息的浏览器桌面通知。
- **@提及强提醒**: 被`@`时会收到高优先级通知，可穿透“免打扰”设置。
- **免打扰 (DND)**: 允许用户将任意会话设为静音，只增加未读数，不弹窗打扰。
- **主题切换**: 支持光明 (Light) 与黑暗 (Dark) 模式一键切换，并记忆用户偏好。

## 🚀 快速开始 (Quick Start)

> **环境要求**
>
> - **Node.js**: `v18.0` 或更高版本
> - **pnpm**: `v8.0` 或更高版本
> - **MongoDB**: 确保本地或远程有一个正在运行的 MongoDB 实例
> - **Redis**: 确保本地或远程有一个正在运行的 Redis 实例

---

### 后端 (Backend)

1.  **进入后端项目并安装依赖**

    ```bash
    cd gameChatBackend
    pnpm install
    ```

2.  **配置环境变量**

    - 复制 `.env.example` 文件为 `.env`。
    - 修改 `.env` 文件，填入你的数据库连接字符串、阿里云 OSS 配置、JWT 密钥等。

3.  **启动后端开发服务器**
    ```bash
    pnpm run dev
    ```
    后端服务将在 `http://localhost:3000` 运行。

### 前端 (Frontend)

4.  **进入前端项目并安装依赖**
    _(请打开一个新的终端窗口)_

    ```bash
    cd gameChatFrontend
    pnpm install
    ```

5.  **启动前端开发服务器**
    ```bash
    pnpm run dev
    ```
    前端应用将在 `http://localhost:5173` (或另一个可用端口) 运行。现在你可以打开浏览器访问它了。

---

## 🎥 更多功能演示 (More Demos)

### 群组与频道全生命周期管理 (Group & Channel Lifecycle Management)
![群组与频道全生命周期管理](https://github.com/qy-8/gamechat-app/blob/main/assets/gameChat_group_and_channel.gif?raw=true)
<p align="center"><i>展示了群组从创建、成员管理（邀请/踢出成员）、信息修改到频道增加与切换、最终解散群组的全生命周期操作，体现了前端状态的实时响应能力。</i></p>

### 智能通知 (Intelligent Notifications)
![智能通知演示](https://github.com/qy-8/gamechat-app/blob/main/assets/gameChat_notifications.gif?raw=true)
<p align="center"><i>演示了普通消息弹窗与@提及穿透免打扰设置。</i></p>


### 无限滚动 (Infinite Scrolling)
![无限滚动演示](https://github.com/qy-8/gamechat-app/blob/main/assets/gameChat_scroll.gif?raw=true)
<p align="center"><i>演示了聊天记录或的无限加载功能，用户滚动到顶部时会自动加载更多内容，提供流畅的浏览体验。</i></p>

### 好友系统与实时交互 (Friend System & Real-time Interaction)
![好友系统演示](https://github.com/qy-8/gamechat-app/blob/main/assets/gameChat_friend_request.gif?raw=true)
<p align="center"><i>通过双窗口演示，直观展示了用户A如何实时接收到用户B的好友请求通知，验证了前后端 WebSocket 通信的有效性。项目还完整支持好友之间消息发送、删除、拉黑、取消拉黑与请求处理等管理功能。</i></p>

### 账户设置 (Account Settings)
![账户设置截图](https://github.com/qy-8/gamechat-app/blob/main/assets/account_settings.png?raw=true)
<p align="center"><i>提供包括头像更换、个人信息修改、密码重置、退出登陆及账户注销在内的完整账户管理功能。</i></p>

---

## 📁 目录结构（Simplified）

```
gamechat-app/
├── gameChatBackend/
│   ├── src/
│   │   ├── controllers/   # Express 控制器层：处理请求/响应
│   │   ├── models/        # Mongoose 数据模型：定义数据库结构 (Schema)
│   │   ├── routes/        # Express 路由：定义 API 端点
│   │   ├── services/      # 核心业务逻辑服务：封装复杂的业务处理
│   │   ├── utils/         # 工具函数模块
│   │   └── docs/          # Swagger API 文档注释
│   └── app.js             # Express 应用主入口
│
├── gameChatFrontend/
│   ├── src/
│   │   ├── api/           # API 请求服务：封装所有与后端的通信
│   │   ├── assets/        # 静态资源与样式
│   │   ├── components/    # 可复用的 Vue 组件
│   │   ├── stores/        # Pinia 状态管理：全局状态中心
│   │   ├── views/         # 页面级组件
│   │   └── router/        # Vue Router 路由配置
│   └── vite.config.js     # Vite 配置文件
│
├── docs/                  # 静态文档发布目录
│   ├── api/               # Swagger API 文档
│   └── code/              # JSDoc 代码文档
└── README.md              # 项目说明
```

---
