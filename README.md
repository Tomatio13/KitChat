<div align="center">

# 🤖 AIチャットアプリケーション

複数のAIプロバイダーに対応した高機能チャットアプリケーション

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Ollama](https://img.shields.io/badge/Ollama-6366F1?style=for-the-badge&logo=llama&logoColor=white)](https://ollama.ai/)
</div>

## 📋 目次
- [🤖 AIチャットアプリケーション](#-aiチャットアプリケーション)
  - [📋 目次](#-目次)
  - [✨ 機能概要](#-機能概要)
  - [🧠 対応AIプロバイダー](#-対応aiプロバイダー)
  - [🛠️ 技術スタック](#️-技術スタック)
  - [⚙️ セットアップ](#️-セットアップ)
    - [環境変数の設定](#環境変数の設定)
  - [🚀 インストール](#-インストール)
  - [📖 使い方](#-使い方)
  - [👨‍💻 開発](#-開発)
  - [📄 ライセンス](#-ライセンス)

## ✨ 機能概要

- **複数AIプロバイダー対応:** 複数のAIプロバイダーから好みのモデルを選択可能
- **ストリーミングレスポンス:** リアルタイムでAIの回答が表示される
- **ローカルメモリツール:** 会話中に情報を一時的に保存・参照可能
- **音声入出力機能:** 音声によるメッセージ入力とAI応答の読み上げに対応
- **Model Context Protocol (MCP):** 外部ツールとの連携機能

## 🧠 対応AIプロバイダー

このアプリケーションは以下のAIプロバイダーとモデルに対応しています：

- **OpenAI**
  - GPT-4o
  - GPT-4o-mini
  - o1-preview
  - その他OpenAIモデル

- **xAI (Grok)**
  - Grok-3-beta
  - Grok-3-mini-beta

- **Google Gemini**
  - Gemini-1.5-pro
  - Gemini-2.0-flash

- **Anthropic**
  - Claude-3-7-sonnet
  - その他Claudeモデル

- **Ollama (ローカルLLM)**
  - Llama 3
  - Phi 3
  - Qwen
  - その他Ollamaでホストされるモデル

- **OpenAI互換サービス**
  - LiteLLM等のOpenAI互換APIサービスにも対応

## 🛠️ 技術スタック

- **フレームワーク**
  - [Next.js](https://nextjs.org/) 15.2.4 (App Router)
  - [React](https://reactjs.org/) 18.2.0
  - [TypeScript](https://www.typescriptlang.org/)

- **UI/スタイリング**
  - [TailwindCSS](https://tailwindcss.com/)
  - [shadcn/ui](https://ui.shadcn.com/) (Radix UI + Tailwind CSS)
  - [Lucide React](https://lucide.dev/) - アイコンライブラリ

- **AI/機械学習**
  - [Vercel AI SDK](https://sdk.vercel.ai/)
  - [@ai-sdk](https://www.npmjs.com/package/ai) (OpenAI/Anthropic/Google/xAI)
  - [ollama-ai-provider](https://sdk.vercel.ai/providers/community-providers/ollama)

- **アクセシビリティ**
  - [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) - 音声入出力

## ⚙️ セットアップ

### 環境変数の設定

プロジェクトのルートディレクトリに `.env.local` ファイルを作成し、以下の設定を行います：

```env
# AI Provider API Keys (使用したいプロバイダーのAPIキーを設定)
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
GROK_API_KEY="YOUR_GROK_API_KEY" 
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
ANTHROPIC_API_KEY="YOUR_ANTHROPIC_API_KEY"

# OpenAI互換サービス設定（オプション）
# OPENAI_BASE_URL="http://localhost:8000/v1"

# Ollama設定（ローカルまたはリモートサーバー）
OLLAMA_BASE_URL="http://localhost:11434/api"

# 使用可能なモデルの設定（JSON形式）
MODELS='{
  "openai":{
    "models":["gpt-4o","gpt-4o-mini","o1"]
  },
  "xai":{
    "models":["grok-3-mini-beta","grok-3-beta"]
  },
  "gemini":{
    "models":["gemini-1.5-pro","gemini-2.0-flash"]
  },
  "anthropic":{
    "models":["claude-3-7-sonnet-20250219"]
  },
  "ollama":{
    "models":["llama3","phi3","qwen3:4b","llava"]
  }
}'

# Model Context Protocol (MCP) Servers設定（オプション）
# 外部ツールサーバーを STDIO 経由で起動するための設定
MCP_SERVERS_JSON='{
  "firecrawl_mcp": {
    "command": "npx",
    "args": ["-y", "firecrawl-mcp"],
    "env": { 
      "FIRECRAWL_API_KEY": "YOUR-API-KEY" 
    }
  }
}'
```

## 🚀 インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/ai-chat-app.git
cd ai-chat-app

# 依存関係をインストール
npm install
# または
yarn install
# または
pnpm install
```

## 📖 使い方

1. **開発サーバーを起動:**
   ```bash
   npm run dev
   ```

2. ブラウザで `http://localhost:3000` を開きます。

3. **モデル選択:**
   - 画面上部のドロップダウンメニューから使用するAIモデルを選択します。
   - 利用可能なモデルは `.env.local` の `MODELS` 設定に依存します。

4. **メッセージの送信:**
   - テキスト入力欄にメッセージを入力して送信ボタンをクリックします。
   - マイクアイコンをクリックして音声入力も可能です。

5. **音声読み上げ:**
   - スピーカーアイコンをクリックしてAIの回答を音声で読み上げることができます。

6. **会話履歴のクリア:**
   - ゴミ箱アイコンをクリックして会話履歴をリセットできます。

7. **ローカルメモリの使用:**
   - `memory_set` / `memory_get` ツールを使用して一時的な情報を保存・参照できます。

## 👨‍💻 開発

```bash
# 開発サーバーを起動
npm run dev

# 本番用ビルドを作成
npm run build

# 本番環境としてアプリを起動
npm start
```

## 📄 ライセンス

[MIT](https://choosealicense.com/licenses/mit/) 