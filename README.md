
```
gamechat
├─ gameChatBackend
│  ├─ .env
│  ├─ .husky
│  │  ├─ commit-msg
│  │  ├─ pre-commit
│  │  └─ _
│  │     ├─ applypatch-msg
│  │     ├─ h
│  │     ├─ husky.sh
│  │     ├─ post-applypatch
│  │     ├─ post-checkout
│  │     ├─ post-commit
│  │     ├─ post-merge
│  │     ├─ post-rewrite
│  │     ├─ pre-applypatch
│  │     ├─ pre-auto-gc
│  │     ├─ pre-merge-commit
│  │     ├─ pre-push
│  │     ├─ pre-rebase
│  │     └─ prepare-commit-msg
│  ├─ .prettierignore
│  ├─ app.js
│  ├─ commitlint.config.js
│  ├─ docs
│  │  ├─ fonts
│  │  │  ├─ OpenSans-Bold-webfont.eot
│  │  │  ├─ OpenSans-Bold-webfont.svg
│  │  │  ├─ OpenSans-Bold-webfont.woff
│  │  │  ├─ OpenSans-BoldItalic-webfont.eot
│  │  │  ├─ OpenSans-BoldItalic-webfont.svg
│  │  │  ├─ OpenSans-BoldItalic-webfont.woff
│  │  │  ├─ OpenSans-Italic-webfont.eot
│  │  │  ├─ OpenSans-Italic-webfont.svg
│  │  │  ├─ OpenSans-Italic-webfont.woff
│  │  │  ├─ OpenSans-Light-webfont.eot
│  │  │  ├─ OpenSans-Light-webfont.svg
│  │  │  ├─ OpenSans-Light-webfont.woff
│  │  │  ├─ OpenSans-LightItalic-webfont.eot
│  │  │  ├─ OpenSans-LightItalic-webfont.svg
│  │  │  ├─ OpenSans-LightItalic-webfont.woff
│  │  │  ├─ OpenSans-Regular-webfont.eot
│  │  │  ├─ OpenSans-Regular-webfont.svg
│  │  │  └─ OpenSans-Regular-webfont.woff
│  │  ├─ global.html
│  │  ├─ index.html
│  │  ├─ scripts
│  │  │  ├─ linenumber.js
│  │  │  └─ prettify
│  │  │     ├─ Apache-License-2.0.txt
│  │  │     ├─ lang-css.js
│  │  │     └─ prettify.js
│  │  ├─ styles
│  │  │  ├─ jsdoc-default.css
│  │  │  ├─ prettify-jsdoc.css
│  │  │  └─ prettify-tomorrow.css
│  │  └─ userHandler.js.html
│  ├─ eslint.config.js
│  ├─ jsdoc.json
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ prettier.config.js
│  ├─ README.md
│  └─ src
│     ├─ config
│     │  ├─ db.js
│     │  └─ index.js
│     ├─ controller
│     │  ├─ groupController.js
│     │  ├─ passwordController.js
│     │  └─ userController.js
│     ├─ handler
│     │  ├─ captchaHandler.js
│     │  └─ userHandler.js
│     ├─ middlewares
│     │  ├─ authMiddleware.js
│     │  └─ upload.js
│     ├─ models
│     │  ├─ Channel.js
│     │  ├─ Group.js
│     │  └─ User.js
│     ├─ routes
│     │  ├─ auth.js
│     │  ├─ captcha.js
│     │  ├─ group.js
│     │  └─ user.js
│     ├─ services
│     │  ├─ authService.js
│     │  └─ smsService.js
│     ├─ socket.js
│     ├─ swagger.js
│     ├─ utils
│     │  ├─ crypto.js
│     │  ├─ generateSmsCode.js
│     │  └─ response.js
│     └─ validators
│        ├─ userValidator.js
│        └─ zhMessages.js
└─ gameChatFrontend
   ├─ .env
   ├─ .husky
   │  ├─ commit-msg
   │  ├─ pre-commit
   │  └─ _
   │     ├─ applypatch-msg
   │     ├─ commit-msg
   │     ├─ h
   │     ├─ husky.sh
   │     ├─ post-applypatch
   │     ├─ post-checkout
   │     ├─ post-commit
   │     ├─ post-merge
   │     ├─ post-rewrite
   │     ├─ pre-applypatch
   │     ├─ pre-auto-gc
   │     ├─ pre-commit
   │     ├─ pre-merge-commit
   │     ├─ pre-push
   │     ├─ pre-rebase
   │     └─ prepare-commit-msg
   ├─ auto-imports.d.ts
   ├─ commitlint.config.js
   ├─ components.d.ts
   ├─ eslint.config.js
   ├─ index.html
   ├─ package.json
   ├─ pnpm-lock.yaml
   ├─ postcss.config.js
   ├─ prettier.config.js
   ├─ public
   │  ├─ animations
   │  │  └─ register-hand.json
   │  └─ images
   │     ├─ background1.avif
   │     ├─ background2.avif
   │     ├─ background3.jpg
   │     ├─ groupImage.png
   │     └─ photo.png
   ├─ README.md
   ├─ src
   │  ├─ api
   │  │  ├─ auth.js
   │  │  └─ group.js
   │  ├─ App.vue
   │  ├─ assets
   │  │  └─ styles
   │  │     ├─ dark.scss
   │  │     ├─ global.scss
   │  │     └─ variables.scss
   │  ├─ components
   │  │  ├─ ChannelChat.vue
   │  │  ├─ ChannelHeader.vue
   │  │  ├─ ChannelMessages.vue
   │  │  ├─ common
   │  │  │  └─ BaseDialog.vue
   │  │  ├─ CreateChannelDialog.vue
   │  │  ├─ CreateGroupDialog.vue
   │  │  ├─ GameChatIcon.vue
   │  │  ├─ GroupInfo.vue
   │  │  ├─ GroupSidebar.vue
   │  │  ├─ LottiePlayer.vue
   │  │  ├─ MessageInput.vue
   │  │  ├─ MessageItem.vue
   │  │  ├─ MessageList.vue
   │  │  ├─ NavBar.vue
   │  │  ├─ SiteFooter.vue
   │  │  └─ ThemeToggle.vue
   │  ├─ composables
   │  │  └─ useCountdown.js
   │  ├─ main.js
   │  ├─ router
   │  │  └─ index.js
   │  ├─ stores
   │  │  ├─ index.js
   │  │  └─ modules
   │  │     ├─ group.js
   │  │     ├─ themeStore.js
   │  │     └─ user.js
   │  ├─ utils
   │  │  └─ request.js
   │  └─ views
   │     ├─ auth
   │     │  ├─ auth.scss
   │     │  ├─ Auth.vue
   │     │  ├─ Login.vue
   │     │  └─ Register.vue
   │     ├─ Chat.vue
   │     ├─ Home.vue
   │     └─ Profile.vue
   └─ vite.config.js

```