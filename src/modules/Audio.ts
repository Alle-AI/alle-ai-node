import { audioGenerateTypes, ttsTypes, sttTypes } from "../types";
import { ValidationError } from "../core/errors";
import { processFile } from "../utils";

// Use require for form-data since it's a CommonJS module
const FormData = require('form-data');
type FormData = import('form-data');

/**
 * Handles audio-related operations, including generating audio from text,
 * text-to-speech, and speech-to-text.
 * @class AlleAudio
 * @example
 * JavaScript (CommonJS) usage:
 * ```javascript
 * const client = require("alle-ai-sdk");
 * async function runAudio() {
 *   const alleai = new client.AlleAIClient({ apiKey: "your-apiKey" });
 *   const audio = await alleai.audio.generate({
 *     models: ["lyria"],
 *     prompt: "A soothing jazz melody with soft piano and gentle saxophone",
 *     model_specific_params: {
 *       // Optional model-specific parameters
 *     }
 *   });
 *   console.log(audio);
 * }
 * runAudio();
 * ```
 * @example
 * TypeScript usage:
 * ```typescript
 * import { AlleAI } from "alle-ai-sdk";
 * async function runAudio() {
 *   const alleai = new AlleAIClient({ apiKey: "your-apiKey" });
 *   const audio = await alleai.audio.generate({
 *     models: ["lyria"],
 *     prompt: "A soothing jazz melody with soft piano and gentle saxophone",
 *     model_specific_params: {
 *       // Optional model-specific parameters
 *     }
 *   });
 *   console.log(audio);
 * }
 * runAudio();
 * ```
 */
class AlleAudio {
  private makeRequest: (endpoint: string, body: object) => Promise<any>;
  private makeFormDataRequest: (
    endpoint: string,
    formData: FormData
  ) => Promise<any>;

  /**
   * Creates an instance of AlleAudio.
   * @param {function} makeRequest - The function to make JSON API requests
   * @param {function} makeFormDataRequest - The function to make FormData API requests
   */
  constructor(
    makeRequest: (endpoint: string, body: object) => Promise<any>,
    makeFormDataRequest: (endpoint: string, formData: FormData) => Promise<any>
  ) {
    this.makeRequest = makeRequest;
    this.makeFormDataRequest = makeFormDataRequest;
  }

  /**
   * Generates audio from the provided text prompt using AI model.
   * @param {audioGenerateTypes} request - The request object containing:
   * - models: Array of model identifiers to use for generation (required) - e.g., ["lyria"]
   * - prompt: Text description of the desired audio (required)
   * - model_specific_params: Additional parameters specific to the model (optional)
   * @returns {Promise<string>} A promise that resolves to the URL of the generated audio
   * @throws {ValidationError} Will throw an error if required parameters are missing or invalid
   * @example
   * JavaScript (CommonJS) usage:
   * ```javascript
   * const client = require("alle-ai-sdk");
   * async function runAudio() {
   *   const alleai = new client.AlleAIClient({ apiKey: "your-apiKey" });
   *   const audio = await alleai.audio.generate({
   *     models: ["lyria"],
   *     prompt: "A soothing jazz melody with soft piano and gentle saxophone",
   *     model_specific_params: {
   *       // Optional model-specific parameters
   *     }
   *   });
   *   console.log(audio);
   * }
   * runAudio();
   * ```
   * @example
   * TypeScript usage:
   * ```typescript
   * import { AlleAI } from "alle-ai-sdk";
   * async function runAudio() {
   *   const alleai = new AlleAIClient({ apiKey: "your-apiKey" });
   *   const audio = await alleai.audio.generate({
   *     models: ["lyria"],
   *     prompt: "A soothing jazz melody with soft piano and gentle saxophone",
   *     model_specific_params: {
   *       // Optional model-specific parameters
   *     }
   *   });
   *   console.log(audio);
   * }
   * runAudio();
   * ```
   */
  async generate({
    models,
    prompt,
    model_specific_params = {},
  }: audioGenerateTypes): Promise<any> {
    // Validate required parameters
    if (!models || !Array.isArray(models) || models.length === 0) {
      throw new ValidationError("models must be a non-empty array of strings");
    }
    if (!models.every((model) => typeof model === "string")) {
      throw new ValidationError("all elements in models must be strings");
    }
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      throw new ValidationError("prompt must be a non-empty string");
    }

    // Simple validation for model_specific_params
    if (
      model_specific_params !== undefined &&
      typeof model_specific_params !== "object"
    ) {
      throw new ValidationError("model_specific_params must be an object");
    }

    return this.makeRequest("/audio/generate", {
      models,
      prompt,
      model_specific_params,
    });
  }

  /**
   * Converts text to speech using AI model.
   * @param {ttsTypes} request - The request object containing:
   * - models: Array of model identifiers to use for text-to-speech (required) - e.g., ["gpt-4o-mini-tts"]
   * - prompt: Text to convert to speech (required)
   * - voice: Voice identifier to use (optional, defaults to "nova")
   * - model_specific_params: Additional parameters specific to the model (optional)
   * @returns {Promise<string>} A promise that resolves to the URL of the generated audio
   * @throws {ValidationError} Will throw an error if required parameters are missing or invalid
   * @example
   * JavaScript (CommonJS) usage:
   * ```javascript
   * const client = require("alle-ai-sdk");
   * async function runTTS() {
   *   const alleai = new client.AlleAIClient({ apiKey: "your-apiKey" });
   *   // With default voice
   *   const audio1 = await alleai.audio.tts({
   *     models: ["gpt-4o-mini-tts"],
   *     prompt: "Welcome to the future of AI technology."
   *   });
   *
   *   // With specific voice
   *   const audio2 = await alleai.audio.tts({
   *     models: ["gpt-4o-mini-tts"],
   *     prompt: "Welcome to the future of AI technology.",
   *     voice: "nova",
   *     model_specific_params: {
   *       // Optional model-specific parameters
   *     }
   *   });
   * }
   * runTTS();
   * ```
   * @example
   * TypeScript usage:
   * ```typescript
   * import { AlleAI } from "alle-ai-sdk";
   * async function runTTS() {
   *   const alleai = new AlleAIClient({ apiKey: "your-apiKey" });
   *   // With default voice
   *   const audio1 = await alleai.audio.tts({
   *     models: ["gpt-4o-mini-tts"],
   *     prompt: "Welcome to the future of AI technology."
   *   });
   *
   *   // With specific voice
   *   const audio2 = await alleai.audio.tts({
   *     models: ["gpt-4o-mini-tts"],
   *     prompt: "Welcome to the future of AI technology.",
   *     voice: "nova",
   *     model_specific_params: {
   *       // Optional model-specific parameters
   *     }
   *   });
   * }
   * runTTS();
   * ```
   */
  async tts({
    models,
    prompt,
    voice = "nova",
    model_specific_params = {},
  }: ttsTypes): Promise<any> {
    // Validate required parameters
    if (!models || !Array.isArray(models) || models.length === 0) {
      throw new ValidationError("models must be a non-empty array of strings");
    }
    if (!models.every((model) => typeof model === "string")) {
      throw new ValidationError("all elements in models must be strings");
    }
    // Validate only one model is provided
    if (models.length > 1) {
      throw new ValidationError(
        "Only one model is supported for text-to-speech processing at this time"
      );
    }
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      throw new ValidationError("prompt must be a non-empty string");
    }

    // Validate voice if provided
    if (voice && typeof voice !== "string") {
      throw new ValidationError("voice must be a string");
    }

    // Simple validation for model_specific_params
    if (
      model_specific_params !== undefined &&
      typeof model_specific_params !== "object"
    ) {
      throw new ValidationError("model_specific_params must be an object");
    }

    return this.makeRequest("/audio/tts", {
      models,
      prompt,
      voice,
      model_specific_params,
    });
  }

  /**
   * Converts speech to text using AI model.
   * @param {sttTypes} request - The request object containing:
   * - models: Array of model identifiers to use for speech-to-text (required) - e.g., ["gpt-4o-transcribe"]
   * - audio_file: Path to audio file or URL (required)
   * - model_specific_params: Additional parameters specific to the model (optional)
   * @returns {Promise<string>} A promise that resolves to the transcribed text
   * @throws {ValidationError} Will throw an error if required parameters are missing or invalid
   * @example
   * JavaScript (CommonJS) usage:
   * ```javascript
   * const client = require("alle-ai-sdk");
   * async function runSTT() {
   *   const alleai = new client.AlleAIClient({ apiKey: "your-apiKey" });
   *   const text = await alleai.audio.stt({
   *     models: ["gpt-4o-transcribe"],
   *     audio_file: "./audio.mp3",  // or "https://example.com/audio.mp3"
   *     model_specific_params: {
   *       // Optional model-specific parameters
   *     }
   *   });
   *   console.log(text);
   * }
   * runSTT();
   * ```
   * @example
   * TypeScript usage:
   * ```typescript
   * import { AlleAI } from "alle-ai-sdk";
   * async function runSTT() {
   *   const alleai = new AlleAIClient({ apiKey: "your-apiKey" });
   *   const text = await alleai.audio.stt({
   *     models: ["gpt-4o-transcribe"],
   *     audio_file: "./audio.mp3",  // or "https://example.com/audio.mp3"
   *     model_specific_params: {
   *       // Optional model-specific parameters
   *     }
   *   });
   *   console.log(text);
   * }
   * runSTT();
   * ```
   */
  async stt({
    models,
    audio_file,
    model_specific_params = {},
  }: sttTypes): Promise<any> {
    // Validate required parameters
    if (!models || !Array.isArray(models) || models.length === 0) {
      throw new ValidationError("models must be a non-empty array of strings");
    }
    if (!models.every((model) => typeof model === "string")) {
      throw new ValidationError("all elements in models must be strings");
    }
    // Validate only one model is provided
    if (models.length > 1) {
      throw new ValidationError(
        "Only one model is supported for speech-to-text processing at this time"
      );
    }
    if (
      !audio_file ||
      typeof audio_file !== "string" ||
      audio_file.trim() === ""
    ) {
      throw new ValidationError("audio_file must be a non-empty string");
    }

    // Simple validation for model_specific_params
    if (
      model_specific_params !== undefined &&
      typeof model_specific_params !== "object"
    ) {
      throw new ValidationError("model_specific_params must be an object");
    }

    try {
      // Process the audio file using the utility function
      const { buffer, filename } = await processFile(audio_file, "audio");

      // Create FormData instance
      const formData = new FormData();

      // Append each model individually
      models.forEach((model, index) => {
        formData.append(`models[${index}]`, model);
      });

      // Append the buffer directly with filename
      formData.append("audio_file", buffer, {
        filename: filename,
      });

      // If we have model specific params, append them
      if (Object.keys(model_specific_params).length > 0) {
        formData.append(
          "model_specific_params",
          JSON.stringify(model_specific_params)
        );
      }

      // Use makeFormDataRequest
      return await this.makeFormDataRequest("/audio/stt", formData);
    } catch (error) {
      throw new ValidationError(
        ` ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

export { AlleAudio };
