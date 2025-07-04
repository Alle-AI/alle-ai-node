import { TextToVideoTypes, VideoEdit } from "../types";
import { ValidationError } from "../core/errors";

// Use require for form-data since it's a CommonJS module
const FormData = require('form-data');
type FormData = import('form-data');

/**
 * Handles video-related operations, including generating videos from text
 * and editing existing videos.
 * @class AlleVideo
 * @example
 * JavaScript (CommonJS) usage:
 * ```javascript
 * const client = require("alle-ai-sdk");
 * async function runVideo() {
 *   const alleai = new client.AlleAIClient({ apiKey: "your-apiKey" });
 *   const video = await alleai.video.generate({
 *     models: ["nova-reel", "veo-2"],
 *     prompt: "Create a video about nature.",
 *     duration: 6,
 *     aspect_ratio: "16:9",
 *     fps: 24,
 *     dimension: "1280x720",
 *     resolution: "720p",
 *     seed: 8,
 *     model_specific_params: {
 *       // Optional model-specific parameters
 *     }
 *   });
 *   console.log(video);
 * }
 * runVideo();
 * ```
 * @example
 * TypeScript usage:
 * ```typescript
 * import { AlleAIClient } from "alle-ai-sdk";
 * async function runVideo() {
 *   const alleai = new AlleAIClient({ apiKey: "your-apiKey" });
 *   const video = await alleai.video.generate({
 *     models: ["nova-reel", "veo-2"],
 *     prompt: "Create a video about nature.",
 *     duration: 6,
 *     aspect_ratio: "16:9",
 *     fps: 24,
 *     dimension: "1280x720",
 *     resolution: "720p",
 *     seed: 8,
 *     model_specific_params: {
 *       // Optional model-specific parameters
 *     }
 *   });
 *   console.log(video);
 * }
 * runVideo();
 * ```
 */
class AlleVideo {
  private makeRequest: (endpoint: string, body: object) => Promise<any>;
  private makeFormDataRequest: (
    endpoint: string,
    formData: FormData
  ) => Promise<any>;

  /**
   * Creates an instance of AlleVideo.
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
   * Generates a video from the provided text prompt using AI models.
   * @param {TextToVideoTypes} request - The request object containing:
   * - models: Array of model identifiers to use for generation (required) - e.g., ["nova-reel", "veo-2"]
   * - prompt: Text description of the desired video (required)
   * - duration: Duration of the video in seconds (optional, default: 6)
   * - loop: Whether to make the video loop (optional, default: false)
   * - aspect_ratio: Aspect ratio of the video (optional, default: "16:9")
   * - fps: Frames per second (optional, default: 24)
   * - dimension: Video dimensions (optional, e.g., "1280x720")
   * - resolution: Video resolution (optional, e.g., "720p")
   * - seed: Random seed for reproducibility (optional)
   * - model_specific_params: Additional parameters specific to the model (optional)
   * @returns {Promise<string>} A promise that resolves to the URL of the generated video
   * @throws {ValidationError} Will throw an error if required parameters are missing or invalid
   * @example
   * JavaScript (CommonJS) usage:
   * ```javascript
   * const client = require("alle-ai-sdk");
   * async function runVideo() {
   *   const alleai = new client.AlleAIClient({ apiKey: "your-apiKey" });
   *   const video = await alleai.video.generate({
   *     models: ["nova-reel", "veo-2"],
   *     prompt: "Create a video about nature.",
   *     duration: 6,
   *     aspect_ratio: "16:9",
   *     fps: 24,
   *     dimension: "1280x720",
   *     resolution: "720p",
   *     seed: 8
   *   });
   *   console.log(video);
   * }
   * runVideo();
   * ```
   * @example
   * TypeScript usage:
   * ```typescript
   * import { AlleAIClient } from "alle-ai-sdk";
   * async function runVideo() {
   *   const alleai = new AlleAIClient({ apiKey: "your-apiKey" });
   *   const video = await alleai.video.generate({
   *     models: ["nova-reel", "veo-2"],
   *     prompt: "Create a video about nature.",
   *     duration: 6,
   *     aspect_ratio: "16:9",
   *     fps: 24,
   *     dimension: "1280x720",
   *     resolution: "720p",
   *     seed: 8
   *   });
   *   console.log(video);
   * }
   * runVideo();
   * ```
   */
  async generate({
    models,
    prompt,
    duration = 6,
    loop = false,
    aspect_ratio = "16:9",
    fps = 24,
    dimension,
    resolution,
    seed,
    model_specific_params = {},
  }: TextToVideoTypes): Promise<any> {
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

    // Validate optional parameters
    if (duration !== undefined) {
      if (typeof duration !== "number" || duration <= 0) {
        throw new ValidationError("duration must be a positive number");
      }
    }

    if (loop !== undefined && typeof loop !== "boolean") {
      throw new ValidationError("loop must be a boolean");
    }

    if (aspect_ratio !== undefined) {
      const [width, height] = aspect_ratio.split(":");
      if (!width || !height || isNaN(Number(width)) || isNaN(Number(height))) {
        throw new ValidationError(
          "aspect_ratio must be in the format 'width:height' (e.g., '16:9')"
        );
      }
    }

    if (fps !== undefined) {
      if (typeof fps !== "number" || fps <= 0) {
        throw new ValidationError("fps must be a positive number");
      }
    }

    if (dimension !== undefined) {
      const [width, height] = dimension.split("x");
      if (!width || !height || isNaN(Number(width)) || isNaN(Number(height))) {
        throw new ValidationError(
          "dimension must be in the format 'widthxheight' (e.g., '1280x720')"
        );
      }
    }

    if (seed !== undefined) {
      if (typeof seed !== "number" || !Number.isInteger(seed)) {
        throw new ValidationError("seed must be an integer");
      }
    }

    // Simple validation for model_specific_params
    if (
      model_specific_params !== undefined &&
      typeof model_specific_params !== "object"
    ) {
      throw new ValidationError("model_specific_params must be an object");
    }

    return this.makeRequest("/video/generate", {
      models,
      prompt,
      duration,
      loop,
      aspect_ratio,
      fps,
      dimension,
      resolution,
      seed,
      model_specific_params,
    });
  }

  /**
   * Edits a video based on the provided parameters using multiple AI models.
   * @param {VideoEdit} request - The request object containing:
   * - models: Array of model identifiers to use for editing
   * - prompt: Description of desired changes to the video
   * - videoUrl: Video input; a video URL link if from a URL, or a base64-encoded string if from a file
   * @returns {Promise<string>} A promise that resolves to the URL of the edited video
   * @throws {ValidationError} Will throw an error if required parameters are missing or invalid
   * @example
   * JavaScript (CommonJS) usage:
   * ```javascript
   * const client = require("alle-ai-sdk");
   * async function runVideoEdit() {
   *   const alleai = new client.AlleAIClient({ apiKey: "your-apiKey" });
   *   const editedVideo = await alleai.video.edit({
   *     models: ['video-model1'],
   *     prompt: 'Add a sunset scene at the beginning',
   *     videoUrl: 'https://example.com/video.mp4'
   *   });
   *   console.log(editedVideo);
   * }
   * runVideoEdit();
   * ```
   * @example
   * TypeScript usage:
   * ```typescript
   * import { AlleAIClient } from "alle-ai-sdk";
   * async function runVideoEdit() {
   *   const alleai = new AlleAIClient({ apiKey: "your-apiKey" });
   *   const editedVideo = await alleai.video.edit({
   *     models: ['video-model1'],
   *     prompt: 'Add a sunset scene at the beginning',
   *     videoUrl: 'https://example.com/video.mp4'
   *   });
   *   console.log(editedVideo);
   * }
   * runVideoEdit();
   * ```
   */
  // unavailable for now : uncomment when available
  // async edit({ models, prompt, videoUrl }: VideoEdit): Promise<any> {
  //   // Validate required parameters
  //   if (!models || !Array.isArray(models) || models.length === 0) {
  //     throw new ValidationError("models must be a non-empty array of strings");
  //   }
  //   if (!models.every((model) => typeof model === "string")) {
  //     throw new ValidationError("all elements in models must be strings");
  //   }
  //   if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
  //     throw new ValidationError("prompt must be a non-empty string");
  //   }
  //   if (!videoUrl || typeof videoUrl !== "string" || videoUrl.trim() === "") {
  //     throw new ValidationError("videoUrl must be a non-empty string");
  //   }

  //   return this.makeRequest("/video/edit", {
  //     models,
  //     prompt,
  //     videoUrl,
  //   });
  // }

  /**
   * Checks the status of a video generation or edit job.
   * @param {string} requestId - The ID of the video job to check (e.g., "alleai-F")
   * @returns {Promise<object>} A promise that resolves to the status information
   * @throws {ValidationError} Will throw an error if request_id is missing or invalid
   * @example
   * JavaScript (CommonJS) usage:
   * ```javascript
   * const client = require("alle-ai-sdk");
   * async function checkVideoStatus() {
   *   const alleai = new client.AlleAIClient({ apiKey: "your-apiKey" });
   *   const status = await alleai.video.get_video_status("alleai-F");
   *   console.log(status);
   * }
   * checkVideoStatus();
   * ```
   * @example
   * TypeScript usage:
   * ```typescript
   * import { AlleAIClient } from "alle-ai-sdk";
   * async function checkVideoStatus() {
   *   const alleai = new AlleAIClient({ apiKey: "your-apiKey" });
   *   const status = await alleai.video.get_video_status("alleai-F");
   *   console.log(status);
   * }
   * checkVideoStatus();
   * ```
   */
  async get_video_status(requestId: string): Promise<any> {
    // Validate request_id
    if (
      !requestId ||
      typeof requestId !== "string" ||
      requestId.trim() === ""
    ) {
      throw new ValidationError("request_id must be a non-empty string");
    }

    // return this.makeRequest("/video/status", {
    //   requestId: requestId
    // });
    return {
      status: "not available",
      message: "This feature is not available yet",
    };
  }
}

export { AlleVideo };
