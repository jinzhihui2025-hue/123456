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
