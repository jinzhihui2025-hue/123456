# 英语背单词系统

纯 HTML + CSS + 原生 JavaScript 的离线 iPhone 风格背单词 Web App。

## 运行

```bash
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000
```

## 功能

- Hash 路由：`#/home`、`#/study`、`#/quiz`、`#/wordbook`、`#/profile`、`#/word/:id`
- localStorage 持久化，所有 key 使用 `vocab_` 前缀
- 简化 SM-2 间隔重复算法
- 学习卡片翻转、左右滑动、自动朗读、Web Audio 本地音效
- 每日测验、词库搜索、单词详情、打卡统计
- 自定义词库 JSON 导入、学习数据 JSON 导出
- 跟随系统的深色模式，也支持手动浅色/深色

## 词库

内置词库共 3000 条，分为 CET4、CET6、IELTS 三个文件，每条包含单词、音标、词性、中文释义、英文例句、中文例句翻译和 level。

词库由 `tools/generate_words.py` 从 ECDICT 数据生成。ECDICT 项目地址：

https://github.com/skywind3000/ECDICT

应用运行时不访问网络，不依赖后端或外部 CDN。

## iPhone 安装 / IPA 打包

最快体验方式：

1. 确保电脑和 iPhone 在同一个局域网。
2. 在项目目录运行 `python -m http.server 8000`。
3. 用 iPhone Safari 打开 `http://电脑局域网IP:8000/`。
4. 点击分享按钮，选择“添加到主屏幕”。

生成真正的 `.ipa` 需要 macOS + Xcode + Apple 签名环境，Windows 不能直接生成可安装 IPA。本项目已加入 Capacitor 配置，可在 Mac 上执行：

```bash
npm install
npm run build
npm run cap:add:ios
npm run cap:open:ios
```

之后每次修改前端文件，运行：

```bash
npm run cap:sync:ios
```

在 Xcode 中选择 Team 和 Bundle Identifier（默认 `com.xie.vocab`），连接 iPhone 后可以直接 Run 到手机。要导出 IPA，则使用 Xcode 的 Product > Archive，再 Distribute App；个人免费 Apple ID 通常适合真机调试安装，长期分发或给别人安装需要 Apple Developer Program 账号。
## 离线缓存 / 流量使用说明

项目已加入 `sw.js` 离线缓存，支持把核心页面、样式、图标和内置词库缓存到本地。

注意：iPhone Safari 的 Service Worker 通常要求 HTTPS。用手机打开 `http://192.168.x.x:8000/` 这种局域网 HTTP 地址时，能在同一 Wi-Fi 下测试，但不一定能离线缓存；离开这个 Wi-Fi 或切到流量后，电脑地址也访问不到。真正打成 Capacitor App 安装到手机后，`www/` 静态资源会跟 App 一起打包进去，不依赖电脑局域网。

## 当前 IPA 打包状态

本项目已经生成 Capacitor iOS 工程：`ios/App/App.xcodeproj`。Windows 上可以完成 `npm run build` 和 `npm run cap:sync:ios`，但不能完成 Apple 签名、Archive 和导出 `.ipa`。

要继续导出 IPA，需要：

- 一台 Mac
- Xcode
- Xcode Command Line Tools
- Apple ID；长期分发或给别人安装通常需要 Apple Developer Program 账号

Mac 上打开项目后运行：

```bash
npm install
npm run build
npm run cap:sync:ios
npx cap open ios
```

然后在 Xcode 里选择 Team，连接 iPhone 后可以直接 Run 到手机；要导出 IPA，用 `Product > Archive`，再 `Distribute App`。
