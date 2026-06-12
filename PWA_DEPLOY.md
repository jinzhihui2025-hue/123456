# 不用 Mac 的手机安装方式

如果没有 Mac 和 Xcode，不能在 Windows 上直接做出可安装的 iPhone `.ipa`。最现实的替代方案是把这个项目发布成 HTTPS PWA，然后在 iPhone Safari 里“添加到主屏幕”。

## 已生成的发布包

上传这个文件即可：

```text
dist/vocab-pwa-site.zip
```

## 最快发布方法

1. 打开 Netlify Drop：
   https://app.netlify.com/drop
2. 登录或注册账号。
3. 把 `dist/vocab-pwa-site.zip` 拖进去上传。
4. Netlify 会给你一个 `https://...netlify.app` 地址。
5. 用 iPhone Safari 打开这个 HTTPS 地址。
6. 点分享按钮，选择“添加到主屏幕”。

第一次打开需要联网加载和缓存。缓存成功后，核心背词功能可以离线打开；如果你更新了代码，需要重新上传这个 ZIP。

## 为什么局域网地址不行

`http://192.168.x.x:8000` 只在同一个 Wi-Fi 下能访问。手机切到流量后，它找不到你电脑的局域网地址。

HTTPS PWA 发布到公网后，手机用 Wi-Fi 或流量都能打开。
