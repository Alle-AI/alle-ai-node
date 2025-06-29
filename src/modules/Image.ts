import { ImageGenerate, ImageEdit } from "../types";
import { ValidationError } from "../core/errors";
import { processFile } from "../utils";

// Use require for form-data since it's a CommonJS module
const FormData = require('form-data');
type FormData = import('form-data');

/**
 * Handles image-related operations, including generating and editing images.
 * @class AlleImage
 * @example
 * JavaScript (CommonJS) usage:
 * ```javascript
 * const client = require("alle-ai-sdk");
 * async function runImage() {
 *   const alleai = new client.AlleAIClient({ apiKey: "your-apiKey" });
 *   const image = await alleai.image.generate({
 *     models: ["dall-e-3", "grok-2-image"],
 *     prompt: "A beautiful landscape at sunset",
 *     width: 1024,
 *     height: 1024,
 *     n: 1,
 *     style_preset: "digital-art",
 *     model_specific_params: {
 *       // Optional model-specific parameters
 *     }
 *   });
 *   console.log(image);
 * }
 * runImage();
 * ```
 * @example
 * TypeScript usage:
 * ```typescript
 * import { AlleAIClient } from "alle-ai-sdk";
 * async function runImage() {
 *   const alleai = new AlleAIClient({ apiKey: "your-apiKey" });
 *   const image = await alleai.image.generate({
 *     models: ["dall-e-3", "grok-2-image"],
 *     prompt: "A beautiful landscape at sunset",
 *     width: 1024,
 *     height: 1024,
 *     n: 1,
 *     style_preset: "digital-art",
 *     model_specific_params: {
 *       // Optional model-specific parameters
 *     }
 *   });
 *   console.log(image);
 * }
 * runImage();
 * ```
 */
class AlleImage {
  private makeRequest: (endpoint: string, body: object) => Promise<any>;
  private makeFormDataRequest: (
    endpoint: string,
    formData: FormData
  ) => Promise<any>;

  /**
   * Creates an instance of AlleImage.
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
   * Generates images from the provided text prompt using multiple AI models.
   * @param {ImageGenerate} request - The request object containing:
   * - models: Array of model identifiers to use for generation (required)
   * - prompt: Text description of the desired image (required)
   * - width: (optional) Output image width in pixels
   * - height: (optional) Output image height in pixels
   * - n: (optional) Number of images to generate (default: 1)
   * - style_preset: (optional) Art style preset to apply
   * - seed: (optional) Random seed for reproducible results, can be null
   * - model_specific_params: (optional) Additional parameters specific to certain models
   * @returns {Promise<string>} A promise that resolves to the URL of the generated image
   * @throws {ValidationError} Will throw an error if required parameters are missing or invalid
   * @example
   * ```typescript
   * const image = await alleai.image.generate({
   *   models: ["dall-e-3", "grok-2-image"],
   *   prompt: "A beautiful landscape at sunset",
   *   width: 1024,
   *   height: 1024,
   *   n: 1,
   *   style_preset: "digital-art"
   * });
   * ```
   */
  async generate({
    models,
    prompt,
    width = 1024,
    height = 1024,
    n = 1,
    style_preset = null,
    seed = null,
    model_specific_params = {},
  }: ImageGenerate): Promise<any> {
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
    if (width !== undefined) {
      if (typeof width !== "number" || !Number.isInteger(width) || width < 64) {
        throw new ValidationError("width must be an integer >= 64");
      }
    }
    if (height !== undefined) {
      if (
        typeof height !== "number" ||
        !Number.isInteger(height) ||
        height < 64
      ) {
        throw new ValidationError("height must be an integer >= 64");
      }
    }
    if (n !== undefined) {
      if (typeof n !== "number" || !Number.isInteger(n) || n < 1) {
        throw new ValidationError("n must be an integer >= 1");
      }
    }
    if (seed !== null && seed !== undefined) {
      if (typeof seed !== "number" || !Number.isInteger(seed)) {
        throw new ValidationError("seed must be an integer or null");
      }
    }
    if (style_preset !== null && style_preset !== undefined) {
      if (typeof style_preset !== "string") {
        throw new ValidationError("style_preset must be a string or null");
      }
    }
    if (model_specific_params !== undefined) {
      if (
        typeof model_specific_params !== "object" ||
        model_specific_params === null
      ) {
        throw new ValidationError("model_specific_params must be an object");
      }
    }

    const body: ImageGenerate = {
      models,
      prompt,
      width,
      height,
      n,
      style_preset,
      seed,
      model_specific_params,
    };

    return await this.makeRequest("/image/generate", body);
  }

  /**
   * Edits an image based on the provided parameters.
   * @param {ImageEdit} request - The request object containing:
   * - models: Array of model identifiers to use for editing (required) - e.g., ["dall-e-3", "titan-image-generator"]
   * - prompt: Description of desired changes (required)
   * - image_file: Path to the image file or URL (required)
   * @returns {Promise<string>} A promise that resolves to the URL of the edited image
   * @throws {ValidationError} Will throw an error if required parameters are missing or invalid
   * @example
   * JavaScript (CommonJS) usage:
   * ```javascript
   * const client = require("alle-ai-sdk");
   * async function runImageEdit() {
   *   const alleai = new client.AlleAIClient({ apiKey: "your-apiKey" });
   *   const editedImage = await alleai.image.edit({
   *     models: ["dall-e-3", "titan-image-generator"],
   *     prompt: "Add a sunset background",
   *     image_file: "./input.jpg"  // or "https://example.com/image.jpg"
   *   });
   *   console.log(editedImage);
   * }
   * runImageEdit();
   * ```
   * @example
   * TypeScript usage:
   * ```typescript
   * import { AlleAIClient } from "alle-ai-sdk";
   * async function runImageEdit() {
   *   const alleai = new AlleAIClient({ apiKey: "your-apiKey" });
   *   const editedImage = await alleai.image.edit({
   *     models: ["dall-e-3", "titan-image-generator"],
   *     prompt: "Add a sunset background",
   *     image_file: "./input.jpg"  // or "https://example.com/image.jpg"
   *   });
   *   console.log(editedImage);
   * }
   * runImageEdit();
   * ```
   */
  async edit({ models, prompt, image_file }: ImageEdit): Promise<any> {
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
    if (
      !image_file ||
      typeof image_file !== "string" ||
      image_file.trim() === ""
    ) {
      throw new ValidationError("image_file must be a non-empty string");
    }

    try {
      // Process the image file
      const { buffer, filename } = await processFile(image_file, "image");

      // Create FormData and append fields
      const formData = new FormData();

      // Append each model
      models.forEach((model, index) => {
        formData.append(`models[${index}]`, model);
      });

      // Append the buffer directly with filename
      formData.append("image_file", buffer, {
        filename: filename,
      });

      // Add the prompt
      formData.append("prompt", prompt);

      return await this.makeFormDataRequest("/image/edit", formData);
    } catch (error) {
      // Enhance error message with more context
      throw new ValidationError(
        `Failed to process image file: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

export { AlleImage };

