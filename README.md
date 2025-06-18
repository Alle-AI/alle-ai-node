# AlleAI TypeScript/JavaScript SDK

[![npm version](https://badge.fury.io/js/alle-ai-sdk.svg)](https://badge.fury.io/js/alle-ai-sdk)
[![Node.js Version](https://img.shields.io/node/v/alle-ai-sdk)](https://nodejs.org/)
[![License](https://img.shields.io/github/license/Alle-AI/alle-ai-node)](https://github.com/Alle-AI/alle-ai-node/blob/main/LICENSE)

A TypeScript/JavaScript SDK for interacting with the AlleAI platform, providing seamless access to state-of-the-art AI models for image generation, audio processing, and video creation. Built with full TypeScript support while maintaining complete JavaScript (CommonJS) compatibility.

## Features

- **Full TypeScript Support** - Complete type definitions with IntelliSense/autocomplete support
- **Chat Completions** - Multiple model support (GPT-4O, O4-Mini, Claude-3-Sonnet) with advanced configuration
- **Image Processing** - High-quality generation and editing with multiple AI models (DALL-E-3, Grok-2)
- **Audio Processing** - Professional Text-to-Speech and Speech-to-Text capabilities
- **Video Generation** - AI-powered video creation with custom parameters
- **JavaScript Compatibility** - Full CommonJS support alongside TypeScript

## Installation

```bash
npm install alle-ai-sdk
```

## Quick Start

### Environment Setup

```bash
echo "ALLEAI_API_KEY=your_api_key_here" > .env
```

### Initialize Client

**TypeScript:**
```typescript
import { AlleAI } from 'alle-ai-sdk';
import dotenv from 'dotenv';

dotenv.config();

const alleai = new AlleAI({
  apiKey: process.env.ALLEAI_API_KEY
});
```

**JavaScript (CommonJS):**
```javascript
const AlleAI = require('alle-ai-sdk');
require('dotenv').config();

const alleai = new AlleAI({
  apiKey: process.env.ALLEAI_API_KEY
});
```

## Usage Examples

### Chat Methods

#### Chat Completions

**TypeScript:**
```typescript
import { AlleAI } from 'alle-ai-sdk';

async function runChat() {
  const alleai = new AlleAI({
    apiKey: process.env.ALLEAI_API_KEY
  });
  
  const chat = await alleai.chat.completions({
    models: ["gpt-4o", "yi-large", "gpt-3-5-turbo"],
    messages: [
      {
        system: [{
          type: "text",
          text: "You are a helpful assistant."
        }]
      },
      {
        user: [{
          type: "text",
          text: "What is photosynthesis?"
        }]
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    frequency_penalty: 0.2,
    presence_penalty: 0.3,
    stream: false
  });
  console.log(chat);
}

runChat();
```

**JavaScript (CommonJS):**
```javascript
const { AlleAI } = require('alle-ai-sdk');

async function runChat() {
  const alleai = new AlleAI({
    apiKey: process.env.ALLEAI_API_KEY
  });
  
  const chat = await alleai.chat.completions({
    models: ["gpt-4o", "yi-large", "gpt-3-5-turbo"],
    messages: [
      {
        system: [{
          type: "text",
          text: "You are a helpful assistant."
        }]
      },
      {
        user: [{
          type: "text",
          text: "What is photosynthesis?"
        }]
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    frequency_penalty: 0.2,
    presence_penalty: 0.3,
    stream: false
  });
  console.log(chat);
}

runChat();
```

#### Model Combination

**TypeScript:**
```typescript
import { AlleAI } from 'alle-ai-sdk';

async function runCombination() {
  const alleai = new AlleAI({
    apiKey: process.env.ALLEAI_API_KEY
  });
  
  const result = await alleai.chat.combination({
    models: ["gpt-4o", "llama-3-1-8b-instruct"],
    messages: [
      {
        system: [{
          type: "text",
          text: "You are a helpful assistant that provides comprehensive answers."
        }]
      },
      {
        user: [{
          type: "text",
          text: "Compare quantum computing with classical computing"
        }]
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });
  
  console.log(result);
}

runCombination();
```

**JavaScript (CommonJS):**
```javascript
const { AlleAI } = require('alle-ai-sdk');

async function runCombination() {
  const alleai = new AlleAI({
    apiKey: process.env.ALLEAI_API_KEY
  });
  
  const result = await alleai.chat.combination({
    models: ["gpt-4o", "llama-3-1-8b-instruct"],
    messages: [
      {
        system: [{
          type: "text",
          text: "You are a helpful assistant that provides comprehensive answers."
        }]
      },
      {
        user: [{
          type: "text",
          text: "Compare quantum computing with classical computing"
        }]
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });
  
  console.log(result);
}

runCombination();
```

#### Model Comparison

**TypeScript:**
```typescript
import { AlleAI } from 'alle-ai-sdk';

async function runComparison() {
  const alleai = new AlleAI({
    apiKey: process.env.ALLEAI_API_KEY
  });
  
  const comparison = await alleai.chat.comparison({
    models: ["gpt-4o-mini", "yi-large"],
    messages: [
      {
        system: [{
          type: "text",
          text: "You are a helpful assistant."
        }]
      },
      {
        user: [{
          type: "text",
          text: "Compare the approaches to async programming in Python and JavaScript."
        }]
      }
    ],
    comparison: [
      {
        type: "text",
        models: ["gpt-4o-mini", "yi-large"]
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });
  
  console.log(comparison);
}

runComparison();
```

**JavaScript (CommonJS):**
```javascript
const { AlleAI } = require('alle-ai-sdk');

async function runComparison() {
  const alleai = new AlleAI({
    apiKey: process.env.ALLEAI_API_KEY
  });
  
  const comparison = await alleai.chat.comparison({
    models: ["gpt-4o-mini", "yi-large"],
    messages: [
      {
        system: [{
          type: "text",
          text: "You are a helpful assistant."
        }]
      },
      {
        user: [{
          type: "text",
          text: "Compare the approaches to async programming in Python and JavaScript."
        }]
      }
    ],
    comparison: [
      {
        type: "text",
        models: ["gpt-4o-mini", "yi-large"]
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });
  
  console.log(comparison);
}

runComparison();
```

#### Web-Enhanced Search

**TypeScript:**
```typescript
import { AlleAI } from 'alle-ai-sdk';

async function runWebSearch() {
  const alleai = new AlleAI({
    apiKey: process.env.ALLEAI_API_KEY
  });
  
  const searchResponse = await alleai.chat.search({
    models: ["gpt-4o", "gpt-3-5-turbo"],
    messages: [
      {
        system: [{
          type: "text",
          text: "You are a helpful assistant with access to current information."
        }]
      },
      {
        user: [{
          type: "text",
          text: "What are the latest developments in quantum computing as of 2024?"
        }]
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: "text" }
  });
  
  console.log(searchResponse);
}

runWebSearch();
```

**JavaScript (CommonJS):**
```javascript
const { AlleAI } = require('alle-ai-sdk');

async function runWebSearch() {
  const alleai = new AlleAI({
    apiKey: process.env.ALLEAI_API_KEY
  });
  
  const searchResponse = await alleai.chat.search({
    models: ["gpt-4o", "gpt-3-5-turbo"],
    messages: [
      {
        system: [{
          type: "text",
          text: "You are a helpful assistant with access to current information."
        }]
      },
      {
        user: [{
          type: "text",
          text: "What are the latest developments in quantum computing as of 2024?"
        }]
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: "text" }
  });
  
  console.log(searchResponse);
}

runWebSearch();
```

### Image Generation

**TypeScript:**
```typescript
import { AlleAI } from 'alle-ai-sdk';

async function generateImage() {
  const alleai = new AlleAI({
    apiKey: process.env.ALLEAI_API_KEY
  });

  const image = await alleai.image.generate({
    models: ["dall-e-3", "grok-2-image"],
    prompt: "futuristic city, flying cars, robotic pedestrians",
    width: 1024,
    height: 1024,
    style_preset: "digital-art",
    n: 1,
    seed: 8
  });
  console.log(image);
}

generateImage();
```

**JavaScript (CommonJS):**
```javascript
const AlleAI = require('alle-ai-sdk');

async function generateImage() {
  const alleai = new AlleAI({
    apiKey: process.env.ALLEAI_API_KEY
  });

  const image = await alleai.image.generate({
    models: ["dall-e-3", "grok-2-image"],
    prompt: "futuristic city, flying cars, robotic pedestrians",
    width: 1024,
    height: 1024,
    style_preset: "digital-art",
    n: 1,
    seed: 8
  });
  console.log(image);
}

generateImage();
```

### Image Editing

```typescript
async function editImage() {
  const editedImage = await alleai.image.edit({
    models: ["dall-e-3"],
    prompt: "Add a lake in the foreground",
    image_file: "./input.jpg"
  });
  console.log(editedImage);
}

editImage();
```

### Text-to-Speech

```typescript
async function textToSpeech() {
  const speech = await alleai.audio.tts({
    models: ["elevenlabs-multilingual-v2", "gpt-4o-mini-tts"],
    prompt: "Hello! You're listening to a test of a text-to-speech model...",
    voice: "nova",
    model_specific_params: {
      "gpt-4o-mini-tts": {
        voice: "alternative-voice"
      }
    }
  });
  console.log(speech);
}

textToSpeech();
```

### Speech-to-Text

```typescript
async function speechToText() {
  const transcription = await alleai.audio.stt({
    models: ["whisper-v3"],
    audio_file: "./audio.mp3"
  });
  console.log(transcription);
}

speechToText();
```

### Video Generation

```typescript
async function generateVideo() {
  const video = await alleai.video.generate({
    models: ["nova-reel", "veo-2"],
    prompt: "robotic arm assembling a car in a futuristic factory",
    duration: 6,
    aspect_ratio: "16:9",
    fps: 24,
    dimension: "1280x720",
    resolution: "720p",
    seed: 8
  });
  console.log(video);
}

generateVideo();
```

### Video Status Check

```typescript
async function checkVideoStatus() {
  const status = await alleai.video.get_video_status("your-request-id");
  console.log(status);
}

checkVideoStatus();
```

## Error Handling

```typescript
async function handleError() {
  try {
    const result = await alleai.image.generate({
      models: ["dall-e-3"],
      prompt: "A beautiful sunset"
    });
    console.log(result);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error("Validation error:", error.message);
    } else {
      console.error("Other error:", error.message);
    }
  }
}

handleError();
```

## Requirements

- Node.js 14 or higher
- Valid AlleAI API key
- `dotenv` package for environment variable management

## Support

For technical support and inquiries:
- Open an issue in our GitHub repository
- Contact our support team at support@alle.ai

## License

This project is licensed under the MIT License - see the LICENSE file for details.
```
```

