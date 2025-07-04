import { ApiRequest } from "../types";
import { ValidationError } from "../core/errors";

/**
 * Handles chat-related operations, including generating completions using the AlleAI platform.
 *
 * This class provides methods to interact with the chat API, supporting multi-model completions
 * with various input types like text, audio, images, and more.
 *
 * @class AlleChat
 * @example
 * JavaScript (CommonJS) usage:
 * ```javascript
 * const client = require("alle-ai-sdk");
 * async function runChat() {
 *   const alleai = new client.AlleAIClient({ apiKey: "your-apiKey" });
 *   const chat = await alleai.chat.completion({
 *     models: ["gpt-4o", "yi-large", "gpt-3-5-turbo"],
 *     messages: [
 *       { system: [{ type: "text", text: "You are a helpful assistant." }] },
 *       { user: [{ type: "text", text: "What is photosynthesis?" }] }
 *     ]
 *   });
 *   console.log(chat);
 * }
 * runChat();
 * ```
 * @example
 * TypeScript usage:
 * ```typescript
 * import { AlleAIClient } from "alle-ai-sdk";
 * async function runChat() {
 *   const alleai = new AlleAIClient({ apiKey: "your-apiKey" });
 *   const chat = await alleai.chat.completion({
 *     models: ["gpt-4o", "yi-large", "gpt-3-5-turbo"],
 *     messages: [
 *       { system: [{ type: "text", text: "You are a helpful assistant." }] },
 *       { user: [{ type: "text", text: "What is photosynthesis?" }] }
 *     ]
 *   });
 *   console.log(chat);
 * }
 * runChat();
 * ```
 */
class AlleChat {
  private makeRequest: (endpoint: string, body: object) => Promise<any>;

  /**
   * Creates an instance of AlleChat with a custom request function.
   *
   * @param {(endpoint: string, body: object) => Promise<any>} makeRequest - The function to make API requests, typically a fetch wrapper.
   */
  constructor(makeRequest: (endpoint: string, body: object) => Promise<any>) {
    this.makeRequest = makeRequest;
  }

  /**
   * Validates the common parameters used in API requests
   *
   * @param {ApiRequest} request - The request object to validate
   * @throws {ValidationError} If any validation fails
   */
  private validateRequestParameters({ models, messages }: ApiRequest): void {
    // Validate models (required)
    if (!models || !Array.isArray(models) || models.length === 0) {
      throw new ValidationError("models must be a non-empty array of strings");
    }
    if (!models.every((model) => typeof model === "string")) {
      throw new ValidationError("all elements in models must be strings");
    }

    // Validate messages (required)
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new ValidationError("messages must be a non-empty array");
    }

    messages.forEach((msg, index) => {
      if (!msg || typeof msg !== "object") {
        throw new ValidationError(`messages[${index}] must be an object`);
      }

      const hasValidKey =
        "system" in msg || "user" in msg || "assistants" in msg;
      if (!hasValidKey) {
        throw new ValidationError(
          `messages[${index}] must have at least one of: system, user, assistants`
        );
      }

      this.validateMessageContent(msg, index);
    });
  }

  /**
   * Validates the content of a message object
   *
   * @param {object} msg - The message object to validate
   * @param {number} index - The index of the message in the messages array
   * @throws {ValidationError} If any validation fails
   */
  private validateMessageContent(msg: any, index: number): void {
    // Validate system and user fields
    for (const key of ["system", "user"] as const) {
      if (key in msg && msg[key]) {
        if (!Array.isArray(msg[key])) {
          throw new ValidationError(
            `${key} must be an array of content objects`
          );
        }

        msg[key]!.forEach((content, i) => {
          this.validateContentObject(content, `${key}[${i}]`);
        });
      }
    }

    // Validate assistants field
    if ("assistants" in msg && msg.assistants) {
      if (typeof msg.assistants !== "object" || Array.isArray(msg.assistants)) {
        throw new ValidationError(
          "assistants must be an object mapping models to content arrays"
        );
      }

      Object.values(msg.assistants).forEach((contents, i) => {
        if (!Array.isArray(contents)) {
          throw new ValidationError(
            `assistants value at index ${i} must be an array`
          );
        }

        contents.forEach((content, j) => {
          this.validateContentObject(content, `assistants value[${j}]`);
        });
      });
    }
  }

  /**
   * Validates a content object
   *
   * @param {any} content - The content object to validate
   * @param {string} path - The path to the content object for error messages
   * @throws {ValidationError} If any validation fails
   */
  private validateContentObject(content: any, path: string): void {
    if (!content || typeof content !== "object" || !("type" in content)) {
      throw new ValidationError(
        `${path} must be an object with a 'type' property`
      );
    }

    const validTypes = ["text", "audio_url", "image_url", "video_url"];
    if (!validTypes.includes(content.type)) {
      throw new ValidationError(
        `${path}.type must be one of: ${validTypes.join(", ")}`
      );
    }
  }

  /**
   * Generate a chat completion with multiple models.
   *
   * @param {ApiRequest} ApiRequest - Parameters for the chat completion.
   *
   * Required Parameters:
   * @param ApiRequest.models - List of model names (e.g., ["gpt-4", "grok", "gemini"])
   * @param ApiRequest.messages - List of message objects, each with optional keys:
   *    - system: System messages (e.g., [{"type": "text", "text": "You are a helper"}])
   *    - user: User messages (e.g., [{"type": "text", "text": "Hello"}])
   *    - assistants: Assistant responses keyed by model name (e.g., {"grok": [{"type": "text", "text": "Hi"}]})
   * @param ApiRequest.response_format - Desired output format:
   *    - type: "text" | "audio_url" | "image_url" | "video_url"
   *    - model_specific: Optional per-model response types (e.g., {"grok": "text"})
   *
   * Optional Parameters:
   * @param ApiRequest.web_search - Enable web search context (default: false)
   * @param ApiRequest.comparison - Compare with type and models
   * @param ApiRequest.combination - Combinations with type and models
   * @param ApiRequest.temperature - Sampling temperature (0.0 to 2.0, default: 1.0)
   * @param ApiRequest.max_tokens - Maximum tokens in the response
   * @param ApiRequest.frequency_penalty - Penalty for frequent words (-2.0 to 2.0, default: 0.0)
   * @param ApiRequest.presence_penalty - Penalty for repeated topics (-2.0 to 2.0, default: 0.0)
   * @param ApiRequest.stream - Stream the response (default: false)
   *
   * @returns {Promise<any>} API response with results from each model, structured according to response_format
   *
   * @throws {ValidationError} If required parameters are missing or invalid
   *
   * @example
   * CommonJS usage:
   * ```javascript
   * const { AlleAIClient } = require("alle-ai-sdk");
   *
   * // Initialize client with API key
   * const alleai = new AlleAIClient({ apiKey: process.env.ALLEAI_API_KEY });
   *
   * // Generate chat completion
   * async function runChat() {
   *   const chat = await alleai.chat.completions({
   *     models: ["gpt-4o", "yi-large", "gpt-3-5-turbo"],
   *     messages: [
   *       {
   *         system: [
   *           {
   *             type: "text",
   *             text: "You are a helpful assistant."
   *           }
   *         ]
   *       },
   *       {
   *         user: [
   *           {
   *             type: "text",
   *             text: "tell me about photosynthesis?"
   *           }
   *         ]
   *       }
   *     ],
   *     temperature: 0.7,
   *     max_tokens: 2000,
   *     frequency_penalty: 0.2,
   *     presence_penalty: 0.3,
   *     stream: false
   *   });
   *
   *   console.log(chat);
   * }
   *
   * runChat();
   * ```
   *
   * @example
   * TypeScript usage:
   * ```typescript
   * import { AlleAIClient } from "alle-ai-sdk";
   *
   * // Initialize client with API key
   * const alleai = new AlleAIClient({ apiKey: process.env.ALLEAI_API_KEY });
   *
   * // Generate chat completion
   * async function runChat() {
   *   const chat = await alleai.chat.completions({
   *     models: ["gpt-4o", "yi-large", "gpt-3-5-turbo"],
   *     messages: [
   *       {
   *         system: [
   *           {
   *             type: "text",
   *             text: "You are a helpful assistant."
   *           }
   *         ]
   *       },
   *       {
   *         user: [
   *           {
   *             type: "text",
   *             text: "tell me about photosynthesis?"
   *           }
   *         ]
   *       }
   *     ],
   *     temperature: 0.7,
   *     max_tokens: 2000,
   *     frequency_penalty: 0.2,
   *     presence_penalty: 0.3,
   *     stream: false
   *   });
   *
   *   console.log(chat);
   * }
   *
   * runChat();
   * ```
   */
  async completions(request: ApiRequest): Promise<any> {
    this.validateRequestParameters(request);

    return this.makeRequest("/chat/completions", request);
  }

  /**
   * Generate a combined output from multiple AI models based on the provided messages.
   *
   * This method shares the same parameter structure as completions(), but specializes in
   * generating unified responses. While completions() returns individual responses from each model,
   * this endpoint synthesizes a single, combined response drawing from all specified models'
   * capabilities and perspectives.
   *
   * @param {ApiRequest} ApiRequest - Parameters for the combination (same structure as completions())
   * @returns {Promise<any>} API response with a combined result, structured according to response_format
   * @throws {ValidationError} If required parameters are missing or invalid
   *
   * @example
   * CommonJS usage:
   * ```javascript
   * const { AlleAIClient } = require("alle-ai-sdk");
   *
   * // Initialize client with API key
   * const alleai = new AlleAIClient({ apiKey: process.env.ALLEAI_API_KEY });
   *
   * // Generate combined output from multiple models
   * async function runCombination() {
   *   const result = await alleai.chat.combination({
   *     models: ["gpt-4o", "llama-3-1-8b-instruct"],
   *     messages: [
   *       {
   *         system: [
   *           {
   *             type: "text",
   *             text: "You are a helpful assistant that provides comprehensive answers."
   *           }
   *         ]
   *       },
   *       {
   *         user: [
   *           {
   *             type: "text",
   *             text: "Compare quantum computing with classical computing"
   *           }
   *         ]
   *       }
   *     ],
   *     temperature: 0.7,
   *     max_tokens: 2000
   *   });
   *
   *   console.log(result);
   * }
   *
   * runCombination();
   * ```
   *
   * @example
   * TypeScript usage:
   * ```typescript
   * import { AlleAIClient } from "alle-ai-sdk";
   *
   * // Initialize client with API key
   * const alleai = new AlleAIClient({ apiKey: process.env.ALLEAI_API_KEY });
   *
   * // Generate combined output from multiple models
   * async function runCombination() {
   *   const result = await alleai.chat.combination({
   *     models: ["gpt-4o", "llama-3-1-8b-instruct"],
   *     messages: [
   *       {
   *         system: [
   *           {
   *             type: "text",
   *             text: "You are a helpful assistant that provides comprehensive answers."
   *           }
   *         ]
   *       },
   *       {
   *         user: [
   *           {
   *             type: "text",
   *             text: "Compare quantum computing with classical computing"
   *           }
   *         ]
   *       }
   *     ],
   *     temperature: 0.7,
   *     max_tokens: 2000
   *   });
   *
   *   console.log(result);
   * }
   *
   * runCombination();
   * ```
   */
  async combination(request: ApiRequest): Promise<any> {
    this.validateRequestParameters(request);

    return this.makeRequest("/chat/combination", request);
  }

  /**
   * Generate focused model-to-model comparisons using the AlleAI platform.
   *
   * This method shares the same parameter structure as completions(), but serves a distinct purpose:
   * while completions() can return both individual responses and comparisons, comparison() specializes
   * in delivering only the comparative analysis between models. This optimization is valuable when your
   * application needs to analyze differences between model responses without processing individual outputs.
   *
   * @param {ApiRequest} ApiRequest - Standard completion parameters as used in completions(), including:
   *    - models: string[] - Models to compare (e.g., ["gpt-4", "grok"])
   *    - messages: Message[] - The conversation context
   *    - response_format: ResponseFormat - Output format specification
   *    - temperature, max_tokens, etc. - Standard generation parameters
   *
   *    The comparison parameter is required for this endpoint:
   *    - comparison: Comparison[] - Specifies comparison configurations
   *        - type: "text" | "audio_url" | "image_url" | "video_url"
   *        - models: string[] - Models to include in comparison
   *
   * @returns {Promise<any>} A structured comparison response containing:
   *    - Comparative analysis between specified models
   *    - Key differences and similarities in model outputs
   *    - Model-specific insights based on the comparison type
   *
   * @throws {ValidationError} If required parameters are missing or invalid
   *
   * Note:
   * This endpoint is optimized for comparison workflows. For individual model responses
   * alongside comparisons, use the completions() endpoint instead.
   *
   * See completions() method documentation for detailed parameter descriptions and options.
   *
   * @example
   * CommonJS usage:
   * ```javascript
   * const { AlleAIClient } = require("alle-ai-sdk");
   *
   * // Initialize client with API key
   * const alleai = new AlleAIClient({ apiKey: process.env.ALLEAI_API_KEY });
   *
   * // Generate model comparison
   * async function runComparison() {
   *   const comparison = await alleai.chat.comparison({
   *     models: ["gpt-4o-mini", "yi-large"],
   *     messages: [
   *       {
   *         system: [
   *           {
   *             type: "text",
   *             text: "You are a helpful assistant."
   *           }
   *         ]
   *       },
   *       {
   *         user: [
   *           {
   *             type: "text",
   *             text: "Compare the approaches to async programming in Python and JavaScript."
   *           }
   *         ]
   *       }
   *     ],
   *     comparison: [
   *       {
   *         type: "text",
   *         models: ["gpt-4o-mini", "yi-large"]
   *       }
   *     ],
   *     temperature: 0.7,
   *     max_tokens: 2000,
   *     frequency_penalty: 0.2,
   *     presence_penalty: 0.3,
   *     stream: false
   *   });
   *
   *   console.log(comparison);
   * }
   *
   * runComparison();
   * ```
   *
   * @example
   * TypeScript usage:
   * ```typescript
   * import { AlleAIClient } from "alle-ai-sdk";
   *
   * // Initialize client with API key
   * const alleai = new AlleAIClient({ apiKey: process.env.ALLEAI_API_KEY });
   *
   * // Generate model comparison
   * async function runComparison() {
   *   const comparison = await alleai.chat.comparison({
   *     models: ["gpt-4o-mini", "yi-large"],
   *     messages: [
   *       {
   *         system: [
   *           {
   *             type: "text",
   *             text: "You are a helpful assistant."
   *           }
   *         ]
   *       },
   *       {
   *         user: [
   *           {
   *             type: "text",
   *             text: "Compare the approaches to async programming in Python and JavaScript."
   *           }
   *         ]
   *       }
   *     ],
   *     comparison: [
   *       {
   *         type: "text",
   *         models: ["gpt-4o-mini", "yi-large"]
   *       }
   *     ],
   *     temperature: 0.7,
   *     max_tokens: 2000,
   *     frequency_penalty: 0.2,
   *     presence_penalty: 0.3,
   *     stream: false
   *   });
   *
   *   console.log(comparison);
   * }
   *
   * runComparison();
   * ```
   */
  async comparison(request: ApiRequest): Promise<any> {
    // this.validateRequestParameters(request);

    return this.makeRequest("/chat/comparison", request);
  }

  /**
   * Generate AI responses enhanced with real-time web search results.
   *
   * This method shares the same parameter structure as completions(), but specializes in
   * web-augmented responses. While completions() can incorporate web search when web_search=True,
   * this dedicated endpoint optimizes for search-enhanced responses. It automatically integrates
   * relevant web information into the model's response without returning separate search results.
   *
   * @param {ApiRequest} ApiRequest - Standard completion parameters as used in completions(), including:
   *    - models: string[] - Models to generate responses (e.g., ["gpt-4", "grok"])
   *    - messages: Message[] - The conversation context
   *    - response_format: ResponseFormat - Output format specification
   *    - temperature, max_tokens, etc. - Standard generation parameters
   *
   *    Note: web_search parameter is automatically set to true for this endpoint
   *
   * @returns {Promise<any>} A structured response containing:
   *    - AI-generated content enriched with web search results
   *    - Seamlessly integrated web information in the response
   *    - Citations and references when applicable
   *
   * @throws {ValidationError} If required parameters are missing or invalid
   *
   * Note:
   * This endpoint is optimized for web-enhanced responses. For separate model responses
   * and web search results, use the completions() endpoint with web_search=true instead.
   *
   * See completions() method documentation for detailed parameter descriptions and options.
   *
   * @example
   * CommonJS usage:
   * ```javascript
   * const { AlleAIClient } = require("alle-ai-sdk");
   *
   * // Initialize client with API key
   * const alleai = new AlleAIClient({ apiKey: process.env.ALLEAI_API_KEY });
   *
   * // Generate web-enhanced response
   * async function runWebSearch() {
   *   const searchResponse = await alleai.chat.search({
   *     models: ["gpt-4o", "gpt-3-5-turbo"],
   *     messages: [
   *       {
   *         system: [
   *           {
   *             type: "text",
   *             text: "You are a helpful assistant with access to current information."
   *           }
   *         ]
   *       },
   *       {
   *         user: [
   *           {
   *             type: "text",
   *             text: "What are the latest developments in quantum computing as of 2024?"
   *           }
   *         ]
   *       }
   *     ],
   *     temperature: 0.7,
   *     max_tokens: 2000,
   *     response_format: { type: "text" }
   *   });
   *
   *   console.log(searchResponse);
   * }
   *
   * runWebSearch();
   * ```
   *
   * @example
   * TypeScript usage:
   * ```typescript
   * import { AlleAIClient } from "alle-ai-sdk";
   *
   * // Initialize client with API key
   * const alleai = new AlleAIClient({ apiKey: process.env.ALLEAI_API_KEY });
   *
   * // Generate web-enhanced response
   * async function runWebSearch() {
   *   const searchResponse = await alleai.chat.search({
   *     models: ["gpt-4o", "gpt-3-5-turbo"],
   *     messages: [
   *       {
   *         system: [
   *           {
   *             type: "text",
   *             text: "You are a helpful assistant with access to current information."
   *           }
   *         ]
   *       },
   *       {
   *         user: [
   *           {
   *             type: "text",
   *             text: "What are the latest developments in quantum computing as of 2024?"
   *           }
   *         ]
   *       }
   *     ],
   *     temperature: 0.7,
   *     max_tokens: 2000,
   *     response_format: { type: "text" }
   *   });
   *
   *   console.log(searchResponse);
   * }
   *
   * runWebSearch();
   * ```
   */
  async search(request: ApiRequest): Promise<any> {
    this.validateRequestParameters(request);
    return this.makeRequest("/ai/web-search", request);
  }
}

export { AlleChat };
