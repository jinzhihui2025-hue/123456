# Windows 云端打 IPA

你有证书的话，可以走云端 Mac 编译。这个项目已经装好 `@capgo/cli`，并加了两个脚本。

## 需要准备

- Capgo 账号和 API Key
- `signing/cert.p12`
- `signing/profile.mobileprovision`

`.mobileprovision` 的 Bundle ID 要匹配当前项目：

```text
com.xie.vocab
```

如果你的描述文件是别的 Bundle ID，需要同步改 `capacitor.config.json` 里的 `appId`。

## 第一步：登录 Capgo

```bash
npx capgo login YOUR_CAPGO_API_KEY
```

## 第二步：保存本机证书配置

把证书文件放到：

```text
signing/cert.p12
signing/profile.mobileprovision
```

然后运行：

```bash
npm run ios:credentials
```

脚本会在本机提示输入 `.p12` 密码。

## 第三步：请求云端构建

```bash
npm run ios:cloud-build
```

构建完成后，输出记录会写到：

```text
dist/capgo-ios-build-output.json
```

如果云端返回下载链接，里面会有 IPA 下载地址和二维码。

## 注意

Capgo 的 Native Cloud Build 当前标注为 limited beta。如果你的账号没有开通云编译权限，这一步可能会被服务端拒绝。那时仍然需要换一个云 Mac/云打包服务，或者找一台 Mac 跑 Xcode。
