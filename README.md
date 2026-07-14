# 马俊龙 AI 产品经理作品集

基于 Next.js 构建的个人作品集，已配置为静态导出，适用于腾讯云 CloudBase 静态网站托管。

## 本地开发

```bash
npm ci
npm run dev
```

访问 `http://localhost:3000`。

## 上线前检查

```bash
npm run lint
npx tsc --noEmit
npm run build
```

构建完成后，静态文件位于 `out` 目录。

## 腾讯云 CloudBase 静态托管

使用 Git 仓库部署时填写：

- Node.js：22.x
- 安装命令：`npm ci`
- 构建命令：`npm run build`
- 输出目录：`out`

图片保持原始 PNG 文件，不进行降分辨率或有损压缩。CloudBase 托管后由 HTTPS 与 CDN 提供静态资源分发。
