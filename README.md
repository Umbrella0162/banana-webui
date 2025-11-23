# 🍌 next-banana

基于 Next.js 16 构建的 Gemini 图像生成 WebUI，提供简洁优雅的用户界面和完整的 API 支持。

> 🤖 **注意**：本项目完全由 Google Antigravity AI 设计与开发。

## ✨ 功能特性

- 🎨 **文本生成图像** - 支持 Markdown 格式的提示词输入，实时预览
- 🖼️ **图像编辑** - 上传参考图像进行编辑和变换
- �️ **智能压缩** - 可选的图片压缩功能，减少传输大小，加快生成速度
- �🔧 **完整参数支持** - 长宽比、分辨率、响应模式、Google 搜索等
- 📦 **批量生成** - 一次生成最多 9 张图像
- 🔍 **大图预览** - 点击图像放大至最大尺寸查看
- 💾 **一键下载** - 快速下载生成的图像
- 🌐 **自定义端点** - 支持配置自定义 API 端点
- 🎯 **多模型支持** - Gemini 2.5 Flash 和 Pro 模型

## 🚀 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 运行开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 配置 API 密钥

1. 点击右上角的设置图标
2. 输入你的 Gemini API 密钥
3. （可选）配置自定义 API 端点
4. 保存设置

## 📝 使用说明

### 基本流程

1. **输入提示词** - 在左侧文本框中输入你想生成的图像描述（支持 Markdown）
2. **（可选）上传参考图像** - 上传一张或多张参考图像
3. **配置参数** - 选择模型、长宽比、分辨率等参数
4. **设置生成数量** - 使用滑块选择生成 1-9 张图像
5. **点击生成** - 等待图像生成完成
6. **查看和下载** - 点击图像放大预览，点击下载按钮保存

### 提示词技巧

- 使用 **粗体** 强调重要元素
- 使用 _斜体_ 标注风格描述
- 详细描述场景、主体、风格、光照等细节
- 参考示例：`一只可爱的**橘猫**坐在咖啡杯旁边，_插画风格_，温暖的光线`

## 🎯 主要功能

### 生成配置

- **长宽比** - 1:1, 3:4, 4:3, 9:16, 16:9 等
- **分辨率** - 1K, 2K, 4K（根据模型支持）
- **响应模式** - 文本和图像、仅图像、仅文本
- **Google 搜索** - 启用实时搜索增强（仅 Flash 模型）
- **压缩参考图像** - 发送前压缩图片（质量 80%，最大 1920px），减少传输时间
- **生成数量** - 1-9 张图像

### 图像预览

- 网格布局展示所有生成的图像
- 点击图像放大至 95% 视口尺寸
- 悬停显示放大图标
- 预览模式下可直接下载

## 🌐 部署

### Vercel 部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mete0rrrrr/next-banana)

1. 点击上方按钮
2. 导入你的 Git 仓库
3. 部署完成后在应用中配置 API 密钥

### 其他平台

本项目是标准的 Next.js 应用，可以部署到任何支持 Next.js 的平台：

- Netlify
- Cloudflare Pages
- AWS Amplify
- 自托管服务器

详见 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)

## 🛠️ 技术栈

- **框架** - Next.js 16 (App Router)
- **UI 组件** - Radix UI + Tailwind CSS
- **图标** - Lucide React
- **Markdown** - react-markdown + remark-gfm
- **通知** - Sonner
- **API** - Google Gemini Image Generation API

## 📄 许可证

MIT License

## 🙏 致谢

- [Google Antigravity](https://antigravity.google/) - 强大的 AI 助手，完成了本项目的代码编写与构建
- [Next.js](https://nextjs.org/) - React 框架
- [Vercel](https://vercel.com/) - 部署平台
- [Google Gemini API](https://ai.google.dev/) - 图像生成 API
