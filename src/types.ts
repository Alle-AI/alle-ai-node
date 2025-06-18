// chat request body
export interface ApiRequest {
  models: string[];
  messages: Message[];
  web_search?: boolean;
  comparison?: boolean | Comparison[];
  combination?: boolean | Combination[];
  response_format?: ResponseFormat;
  temperature?: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
  model_specific_params?: Record<string, ModelSpecificParams>;
}

interface Message {
  system?: Content[];
  user?: Content[];
  assistants?: Record<string, Content[]>;
}

interface Content {
  type: "text" | "audio_url" | "image_url" | "video_url";
  [key: string]: any;
}

interface Comparison {
  type: "text" | "audio_url" | "image_url" | "video_url";
  models: string[];
}

interface Combination {
  type: "text" | "audio_url" | "image_url" | "video_url";
  models: string[];
}

interface ResponseFormat {
  type: "text" | "audio_url" | "image_url" | "video_url";
  model_specific?: Record<
    string,
    "text" | "audio_url" | "image_url" | "video_url"
  >;
}
interface ModelSpecificParams {
  system?: string;
  temperature?: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}
//  image types
export interface ImageGenerate {
  models: string[]; // Required - e.g., ["dall-e-3", "grok-2-image"]
  prompt: string; // Required
  n?: number; // Optional (default: 1)
  height?: number; // Optional
  width?: number; // Optional
  seed?: number | null; // Optional
  style_preset?: string | null; // Optional
  model_specific_params?: Record<string, any>; // Optional
}

export interface ImageEdit {
  models: string[]; // Required - e.g., ["dall-e-3", "titan-image-generator"]
  prompt: string; // Required
  image_file: string; // Required - local file path or URL
}

// Audio Types

// Text-to-Speech (TTS)
export interface ttsTypes {
  models: string[]; // Required - e.g., ["gpt-4o-mini-tts"]
  prompt: string; // Required
  voice?: string; // Optional - defaults to "nova"
  model_specific_params?: Record<string, any>; // Optional
}

// Speech-to-Text (STT)
export interface sttTypes {
  models: string[]; // Required - e.g., ["gpt-4o-transcribe"]
  audio_file: string; // Required - local file path or URL
  model_specific_params?: Record<string, any>; // Optional
}

// Audio Generation
export interface audioGenerateTypes {
  models: string[]; // Required - e.g., ["lyria"]
  prompt: string; // Required
  model_specific_params?: Record<string, any>; // Optional
}

// Audio Edit
export interface audioEdit {
  models: string[];
  audioUrl: string;
  edit_type: "mix" | "trim" | "filter" | "enhance";
  prompt?: string;
  start_time?: number;
  end_time?: number;
  filters?: {
    noise_reduction?: boolean;
    equalizer?: Record<string, number>;
    reverb?: number;
    compression?: boolean;
  };
  output_format?: "mp3" | "wav" | "ogg";
  quality?: "standard" | "hd";
  preserve_original?: boolean; // Keep original audio characteristics
}

// text to video types

export interface TextToVideoTypes {
  models: string[]; // Required - e.g., ["nova-reel", "veo-2"]
  prompt: string; // Required
  duration?: number; // Optional - e.g., 6 seconds
  loop?: boolean; // Optional - default: false
  aspect_ratio?: string; // Optional - e.g., "16:9"
  fps?: number; // Optional - e.g., 24
  dimension?: string; // Optional - e.g., "1280x720"
  resolution?: string; // Optional - e.g., "720p"
  seed?: number; // Optional - e.g., 8
  model_specific_params?: Record<string, any>; // Optional
}

export interface VideoEdit {
  models: string[];
  prompt: string;
  videoUrl: string;
}
