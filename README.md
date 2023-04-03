# Chroma Embeddings Database Demo 🫐🍌🍎

This is a demo of the [Chroma Embeddings Database](https://docs.trychroma.com) API. It uses the Chroma Embeddings NodeJS SDK and the [OpenAI embeddings model](https://platform.openai.com/docs/guides/embeddings).

## Setup

### Clone the repo

```bash
git clone
```

### Clone Chroma

```bash
git clone git@github.com:chroma-core/chroma.git
```

### Install dependencies

```bash
npm install
```

### Create a .env file and add your API keys

```bash
cp .env.example .env
```

### Run Chroma

```bash
cd chroma
docker-compose up -d --build
```

### Run the script

```bash
npm start
```
