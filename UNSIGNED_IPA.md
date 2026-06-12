# 未签名 IPA 给全能签使用

全能签这类工具可以签名/重签已有 IPA，但不能把 HTML、JS 或 Xcode 源码编译成 IPA。项目必须先经过 iOS 编译，生成 `Payload/App.app`，再压成 `.ipa`。

本项目已经加好未签名 IPA 构建脚本：

```text
tools/build_unsigned_ipa.sh
.github/workflows/build-unsigned-ipa.yml
```

## 最省事方案：GitHub Actions 云编译

1. 把整个项目上传到 GitHub 仓库。
2. 打开仓库的 `Actions`。
3. 选择 `Build unsigned IPA`。
4. 点 `Run workflow`。
5. 构建完成后，在页面底部下载 artifact：`vocab-unsigned-ipa`。
6. 解压 artifact，里面是：

```text
vocab-unsigned.ipa
```

这个 IPA 就可以拿去全能签里上传证书签名。

## 如果有 macOS 机器

在 macOS 上直接运行：

```bash
npm install
npm run ios:unsigned-ipa:mac
```

输出文件：

```text
dist/vocab-unsigned.ipa
```

## 为什么 Windows 不能直接出这个 IPA

IPA 不是简单压缩包，它里面必须有 iOS 可执行文件。这个可执行文件需要 Apple 的 iOS SDK 和 `xcodebuild` 编译出来，而 `xcodebuild` 只在 macOS/Xcode 里提供。

如果只把网页文件改名成 `.ipa`，全能签会签名失败或安装后打不开，因为里面没有 iOS App 可执行文件。
