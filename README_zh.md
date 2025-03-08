# AI Chess Game

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 项目简介

这是一个基于AI的国际象棋游戏，玩家可以与AI对战。项目使用`chess.js`库处理棋局逻辑，并通过OpenRouter API获取AI的移动建议。

## 主要功能

- 🎮 与AI对战
- 📜 移动历史记录
- 🤖 支持多种AI模型
- 🌐 响应式界面设计

## 快速开始

### 环境要求

- Node.js 16+
- npm 7+

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/Way-To-AGI/ai-chess.git

# 进入项目目录
cd ai-chess

# 安装依赖
npm install
```

### 运行项目

```bash
# 启动开发服务器
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可开始游戏。

## 项目结构

```
ai-chess/
├── src/               # 源代码目录
├── public/            # 静态资源
├── package.json       # 项目依赖
├── LICENSE            # 许可证文件
└── README.md          # 项目说明
```

## 如何贡献

我们欢迎任何形式的贡献！请遵循以下步骤：

1. Fork 本项目
2. 创建您的特性分支 (`git checkout -b feature/YourFeature`)
3. 提交您的更改 (`git commit -m 'Add some feature'`)
4. 推送到分支 (`git push origin feature/YourFeature`)
5. 创建一个 Pull Request

请确保您的代码遵循项目代码风格，并通过所有测试。

## 许可证

本项目采用 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件。

## 致谢

- [chess.js](https://github.com/jhlywa/chess.js) - 国际象棋逻辑库
- OpenRouter API - AI 移动建议
