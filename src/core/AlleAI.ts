import { AlleChat } from "../modules/chat";
import { AlleImage } from "../modules/Image";
import { AlleAudio } from "../modules/Audio";
import { AlleVideo } from "../modules/Video";
import {
  AlleAIError,
  ValidationError,
  APIError,
  AuthenticationError,
  InvalidRequestError,
  RateLimitError,
  ServiceUnavailableError,
  ConnectionError,
} from "./errors";

// Use require for CommonJS modules
const FormData = require('form-data');
const fetch = require('node-fetch');
type FormData = import('form-data');
type FetchResponse = import('node-fetch').Response;

/**
 * Configuration interface for AlleAI SDK
 * @interface AlleAIConfig
 * @property {string} apiKey - The API key for authentication
 * @property {string} [baseUrl] - Optional base URL for the API
 */
export interface AlleAIConfig {
  apiKey: string;
  baseUrl?: string;
}

/**
 * Main class for interacting with the Alle AI API
 * @class AlleAIClient
 * @example
 * ```typescript
 * const alle = new AlleAIClient({
 *   apiKey: 'your-api-key'
 * });
 * ```
 */
class AlleAIClient {
  private apiKey: string;
  private baseUrl: string;
  public chat: AlleChat;
  public image: AlleImage;
  public audio: AlleAudio;
  public video: AlleVideo;

  /**
   * Creates an instance of AlleAI.
   * @param {AlleAIConfig} config - The configuration object
   * @throws {ValidationError} Will throw an error if apiKey is not provided
   */
  constructor(config: AlleAIConfig) {
    if (!config.apiKey) {
      throw new ValidationError("API key is required", "MISSING_API_KEY");
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.alle-ai.com/api/v1";

  
    const handleErrorResponse = async (
      response: FetchResponse
    ): Promise<never> => {
      const status = response.status;
      let errorMessage = `Request failed with status: ${status}`;

      try {
        const errorBody = await response.text();

        // Check if the entire response is HTML
        if (
          errorBody.includes("<!DOCTYPE html>") ||
          errorBody.includes("<html")
        ) {
          errorMessage =
            "Server responded with unknown format. Please try again later.";
        } else {
          // Try to parse as JSON if not HTML
          try {
            const errorJson = JSON.parse(errorBody);

            // Check if JSON response has HTML in details.raw
            if (
              errorJson.details?.raw &&
              (errorJson.details.raw.includes("<!DOCTYPE html>") ||
                errorJson.details.raw.includes("<html"))
            ) {
              errorMessage =
                "Server responded with unknown format. Please try again later.";
            } else if (errorJson.message) {
              errorMessage = errorJson.message;
            } else if (errorJson.error) {
              errorMessage =
                typeof errorJson.error === "string"
                  ? errorJson.error
                  : JSON.stringify(errorJson.error);
            }
          } catch (parseError) {
            // If not valid JSON and not HTML, use generic message
            errorMessage =
              "Server responded with unknown format. Please try again later.";
          }
        }
      } catch (textError) {
        // In case response.text() fails
        errorMessage =
          "Server responded with unknown format. Please try again later.";
      }

      // Map HTTP status codes to specific error types with clean error structure
      const errorResponse = {
        message: errorMessage,
        status: status,
      };

      switch (status) {
        case 400:
          throw new InvalidRequestError(
            errorMessage,
            "INVALID_REQUEST",
            errorResponse
          );
        case 401:
          throw new AuthenticationError(
            errorMessage,
            "AUTH_ERROR",
            errorResponse
          );
        case 403:
          throw new AuthenticationError(
            errorMessage,
            "PERMISSION_DENIED",
            errorResponse
          );
        case 404:
          throw new APIError(
            errorMessage,
            "RESOURCE_NOT_FOUND",
            status,
            errorResponse
          );
        case 429:
          throw new RateLimitError(errorMessage, "RATE_LIMIT", errorResponse);
        case 500:
        case 502:
        case 503:
        case 504:
          throw new ServiceUnavailableError(
            errorMessage,
            "SERVICE_ERROR",
            errorResponse
          );
        default:
          throw new APIError(
            errorMessage,
            `API_ERROR_${status}`,
            status,
            errorResponse
          );
      }
    };

    // HTTP request method for JSON requests
    const makeRequest = async (
      endpoint: string,
      body: object
    ): Promise<any> => {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: "POST",
          headers: {
            "X-API-KEY": this.apiKey,
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          await handleErrorResponse(response);
        }

        try {
          const data = await response.json();
          return data;
        } catch (parseError: any) {
          throw new APIError(
            "Server returned invalid JSON response",
            "INVALID_RESPONSE",
            response.status,
            { message: "Invalid JSON response" }
          );
        }
      } catch (error) {
        if (error instanceof AlleAIError) {
          throw error;
        }

        if (error instanceof TypeError && error.message.includes("fetch")) {
          throw new ConnectionError(
            "Could not connect to the API. Please check your internet connection.",
            "CONNECTION_ERROR",
            { originalError: error.message }
          );
        }

        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new APIError(
          `An unexpected error occurred: ${errorMessage}`,
          "UNEXPECTED_ERROR",
          undefined,
          { originalError: errorMessage }
        );
      }
    };

    // HTTP request method for FormData requests
    const makeFormDataRequest = async (
      endpoint: string,
      formData: FormData
    ): Promise<any> => {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: "POST",
          headers: {
            "X-API-KEY": this.apiKey,
            Authorization: `Bearer ${this.apiKey}`,
            ...formData.getHeaders(),
          },
          body: formData,
        });

        if (!response.ok) {
          await handleErrorResponse(response);
        }

        try {
          const data = await response.json();
          return data;
        } catch (parseError: any) {
          throw new APIError(
            "Server returned invalid JSON response",
            "INVALID_RESPONSE",
            response.status,
            { message: "Invalid JSON response" }
          );
        }
      } catch (error) {
        if (error instanceof AlleAIError) {
          throw error;
        }

        if (error instanceof TypeError && error.message.includes("fetch")) {
          throw new ConnectionError(
            "Could not connect to the API. Please check your internet connection.",
            "CONNECTION_ERROR",
            { originalError: error.message }
          );
        }

        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new APIError(
          `An unexpected error occurred: ${errorMessage}`,
          "UNEXPECTED_ERROR",
          undefined,
          { originalError: errorMessage }
        );
      }
    };

    //module instances with both request methods
    this.chat = new AlleChat(makeRequest);
    this.image = new AlleImage(makeRequest, makeFormDataRequest);
    this.audio = new AlleAudio(makeRequest, makeFormDataRequest);
    this.video = new AlleVideo(makeRequest, makeFormDataRequest);
  }
}

export { AlleAIClient };
