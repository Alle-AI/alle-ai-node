import { ModelRequest, ModelType, ModelQueryParams } from "../types";

class AlleModels {
  private makeRequest: (endpoint: string, body: object) => Promise<any>;

  constructor(makeRequest: (endpoint: string, body: object) => Promise<any>) {
    this.makeRequest = makeRequest;
  }

  /**
   * Get all available models
   * @returns Promise<any> List of all available models
   */
  async getAllModels(): Promise<any> {
    const request: ModelRequest = {
      type: 'all'
    };
    return this.makeRequest("/ai_models", request);
  }

  /**
   * Get models by specific type (chat, image, audio, video)
   * @param type ModelType - The type of models to retrieve
   * @returns Promise<any> List of models matching the specified type
   */
  async getModelsByType(type: ModelType): Promise<any> {
    if (!this.validateModelType(type)) {
      throw new Error(`Invalid model type: ${type}`);
    }

    const request: ModelRequest = {
      type
    };
    return this.makeRequest("/ai_models", request);
  }

  /**
   * Search models with specific criteria using model name and optional filters.
   * 
   * @param params ModelQueryParams - Search parameters:
   *   - model_name: Required - name of the model to search for
   *   - provider?: Optional - filter by provider
   *   - capability?: Optional - filter by capability
   * @param type ModelType - Model type to filter by ('chat', 'image', 'audio', 'video'). 
   *                        Defaults to 'all' if not specified.
   * @returns Promise<any> List of models matching the search criteria
   * 
   * @example
   * // Search for GPT models in the chat category
   * const models = await client.models.searchModels(
   *   {
   *     model_name: "gpt",           // Required
   *     provider: "openai",          // Optional
   *     capability: "text-generation" // Optional
   *   },
   *   'chat'  // Optional: can be 'chat', 'image', 'audio', 'video', or omit for 'all'
   * );
   */
  async searchModels(params: ModelQueryParams, type: ModelType = 'all'): Promise<any> {
    if (!this.validateModelType(type)) {
      throw new Error(`Invalid model type: ${type}`);
    }

    const request: ModelRequest = {
      type,
      params
    };
    return this.makeRequest("/ai_models", request);
  }

  /**
   * Validate model type
   * @param type ModelType - The type to validate
   * @returns boolean
   */
  private validateModelType(type: ModelType): boolean {
    const validTypes: ModelType[] = ['chat', 'image', 'audio', 'video', 'all'];
    return validTypes.includes(type);
  }
}

export { AlleModels };