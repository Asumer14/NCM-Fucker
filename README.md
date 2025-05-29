# NCM-Fucker

🎵 一个强大的网易云音乐 NCM 格式文件转换工具

## 功能特性

- 📁 支持批量转换 NCM 文件
- 🎵 自动检测音频格式 (MP3, FLAC, OGG, M4A)
- 🖼️ 保留专辑封面和音乐元数据
- 💻 基于现代 Web 技术构建 (Next.js 14, TypeScript)
- 🚀 客户端处理，保护隐私安全
- 📱 响应式设计，支持移动端

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **类型系统**: TypeScript
- **样式方案**: Tailwind CSS + shadcn/ui
- **文件处理**: Web Workers (多线程)
- **加密解密**: 基于 unlock-music 项目的权威算法

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
npm start
```

## 使用方法

1. 访问 [项目网站](your-website-url)
2. 拖拽或选择 NCM 文件到上传区域
3. 等待转换完成
4. 下载转换后的音频文件

## 支持的格式

### 输入格式
- `.ncm` - 网易云音乐加密格式

### 输出格式
- `.mp3` - MP3 音频格式
- `.flac` - 无损音频格式
- `.ogg` - Ogg Vorbis 格式
- `.m4a` - AAC 音频格式

## 技术实现

本项目采用了基于 [unlock-music](https://github.com/unlock-music/unlock-music) 项目的权威 NCM 解密算法，包括：

- **AES-128-ECB** 密钥解密
- **RC4 密钥调度算法** (KSA)
- **keyBox 算法** 音频数据解密
- **多格式音频检测** 智能识别输出格式

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 免责声明

本工具仅用于个人学习和研究目的，请勿用于商业用途。请尊重音乐版权，支持正版音乐。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v2.0.0 (2024)
- 🔄 重构 NCM 解码器，提升兼容性
- 🎨 全新 UI 设计，更好的用户体验
- 🚀 性能优化，支持大文件处理
- 📱 移动端适配
- 🛠️ 修复多项已知问题

### v1.0.0
- 🎉 首次发布
- ✨ 基础 NCM 转换功能 