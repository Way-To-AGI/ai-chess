# AI Chess Game

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## README.md

- [中文](README_zh.md)
- [English](README.md)

## Project Overview

This is an AI - vs - AI chess game with two large - scale models competing. The project uses the chess.js library for game logic and integrates the OpenRouter API for the models to generate move suggestions, creating an exciting algorithmic battle.

## Key Features

- 🎮 AI VS AI chess 
- 📜 Move history tracking
- 🤖 Support for multiple AI models
- 🌐 Responsive UI design

## Quick Start

### Prerequisites

- Node.js 16+
- npm 7+

### Installation

```bash
# Clone the repository
git clone https://github.com/Mrdapeng/ai-chess.git

# Navigate to the project directory
cd ai-chess

# Install dependencies
npm install
```

### Running the Project

```bash
# Start the development server
npm run dev
```

Open your browser and visit [http://localhost:3000](http://localhost:3000) to start playing.

## Project Structure

```
ai-chess/
├── src/               # Source code
├── public/            # Static assets
├── package.json       # Project dependencies
├── LICENSE            # License file
└── README.md          # Project documentation
```

## Contributing

We welcome contributions of all kinds! Please follow these steps:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

Please ensure your code follows the project's coding style and passes all tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [chess.js](https://github.com/jhlywa/chess.js) - Chess logic library
- OpenRouter API - AI move suggestions
