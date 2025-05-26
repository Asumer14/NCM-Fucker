# 🎵 NCM音乐格式转换器

一个专业的网易云音乐NCM格式转换工具，基于Next.js 15构建，支持将加密的NCM文件转换为标准的MP3和FLAC格式。

## ✨ 主要特性

- 🔓 **NCM解密转换** - 支持网易云音乐NCM格式解密
- 🎯 **多格式输出** - 支持转换为MP3和FLAC格式
- 📦 **批量处理** - 支持同时处理多个文件
- 🌓 **深浅色主题** - 完美的深浅色模式切换
- 📱 **响应式设计** - 适配桌面端和移动端
- 🔒 **本地处理** - 所有转换在本地完成，保护隐私
- ⚡ **Web Workers** - 使用Web Workers避免UI阻塞
- 📊 **实时进度** - 实时显示转换进度

## 🚀 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI组件**: Radix UI + shadcn/ui
- **主题**: next-themes
- **加密**: crypto-js
- **图标**: Lucide React

## 📦 安装和运行

### 环境要求

- Node.js 18+ 
- npm 或 yarn

### 安装依赖

```bash
npm install --force
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 🎯 使用方法

### 1. 上传NCM文件
- 点击上传区域或拖拽NCM文件到上传区域
- 支持批量选择多个文件
- 只接受`.ncm`格式的文件

### 2. 选择输出格式
- **MP3**: 通用格式，文件较小，兼容性好
- **FLAC**: 无损格式，音质最佳，文件较大

### 3. 开始转换
- 点击"开始转换"按钮
- 查看实时转换进度
- 等待所有文件转换完成

### 4. 下载文件
- 单独下载每个转换后的文件
- 或选择打包为ZIP下载（开发中）

## 🔧 核心功能实现

### NCM文件解密

NCM文件是网易云音乐的加密格式，解密流程包括：

1. **文件头验证** - 检查`CTENFDAM`文件头
2. **密钥解密** - 使用AES ECB解密密钥数据
3. **元数据解密** - 解密音乐元信息
4. **音频解密** - 使用RC4算法解密音频数据
5. **格式检测** - 自动检测输出格式（MP3/FLAC）

### Web Workers处理

为了避免大文件处理时阻塞UI，使用Web Workers：

```typescript
// 在Worker中处理NCM解密
const result = await SimpleNCMDecoder.decode(file, (progress) => {
  // 发送进度更新
  self.postMessage({ type: 'progress', progress })
})
```

### 主题切换

实现了完善的深浅色主题切换：

```typescript
// 使用next-themes处理主题
const { theme, setTheme } = useTheme()
```

## 📁 项目结构

```
NCM-Converter-main/
├── app/                    # Next.js App Router
│   ├── convert/           # 转换相关页面
│   │   ├── page.tsx      # 转换主页面
│   │   └── progress/     # 转换进度页面
│   ├── globals.css       # 全局样式
│   └── layout.tsx        # 根布局
├── components/            # React组件
│   ├── ui/               # UI基础组件
│   ├── layout/           # 布局组件
│   └── theme-provider.tsx # 主题提供者
├── lib/                  # 工具库
│   ├── ncm-decoder.ts    # NCM解码器
│   └── convert-worker.ts # Web Worker
└── public/               # 静态资源
```

## 🔒 隐私和安全

- ✅ **本地处理** - 所有文件处理在浏览器本地完成
- ✅ **无服务器上传** - 文件不会上传到任何服务器
- ✅ **内存安全** - 处理完成后自动清理内存
- ✅ **开源透明** - 代码完全开源，可审查

## 🛠️ 开发说明

### 添加新功能

1. 在`lib/`目录下添加新的工具函数
2. 在`components/`目录下创建新组件
3. 在`app/`目录下添加新页面

### 自定义样式

项目使用Tailwind CSS，可以在`tailwind.config.ts`中自定义配置。

### 环境变量

在`.env.local`中配置环境变量：

```env
NEXT_PUBLIC_APP_NAME=NCM转换器
```

## 📝 待办事项

- [ ] 添加ZIP打包下载功能
- [ ] 支持更多音频格式输出
- [ ] 添加音频质量选择
- [ ] 实现拖拽排序功能
- [ ] 添加转换历史记录
- [ ] 支持批量重命名
- [ ] 添加音频预览功能

## 🤝 贡献

欢迎提交Issue和Pull Request！

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目基于MIT许可证开源。详见[LICENSE](LICENSE)文件。

## ⚠️ 免责声明

本工具仅供学习和个人使用。请遵守相关法律法规和版权规定，不要用于商业用途或侵犯他人版权。

---

**Made with ❤️ by [Your Name]**