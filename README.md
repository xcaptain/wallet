
# wallet

基于 circle wallet 基础架构实现的一个web2钱包 app，用户进行登录授权后可以访问自己的钱包，再发送交易时，通过两步验证（输入PIN）来确认发送

## 网站

网站是核心组件，用户在网站上直接登录，可以访问自己的钱包

### auth

circle wallet sdk 内置了一些登录方式，如 google oauth, email，但是在这里我们使用已经很成熟的 `authjs` 来实现各种登录方式。对于 circle 来说，不在乎用户在 app 侧是如何登录的，app 登录成功后，去 circle 注册用户，创建钱包，设置 PIN 才是circle 要关注的



## Wallet widget

这是一个钱包小挂件，传统钱包如 metamask, phantom 要求安装浏览器插件，而支持 walletConnect 协议的客户端钱包，需要扫描二维码授权网站使用钱包。
我这个 widget 希望做成一段js代码，能集成到网站上，用户点击一个按钮，就能解锁自己的钱包，跟当前网页功能进行交互

### Wagmi connector

要实现一个浏览器内的钱包，要自己实现一个 wagmi connector，这样才能方便开发者集成，并且遵循钱包的标准。

### dAPP market

钱包做完后，还可以内置一些应用，这样可以快速给第三方app导流，获得一些额外的收入和合作

## 架构

网站部署在新的 cloudflare workers 上，使用 `wrangler.jsonc` 作为配置文件

### 初始化数据库

```shell
wrangler d1 execute prod-wallet --file="./database/schema.sql"
```

### 配置环境变量

```shell
wrangler secret put AUTH_SECRET
wrangler secret put AUTH_GOOGLE_ID
wrangler secret put AUTH_GOOGLE_SECRET
```

### 前端框架

- svelte 5(rune)
- tailwindcss v4
- daisyui v5
- authjs
