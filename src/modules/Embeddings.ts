import { ValidationError } from "../core/errors";
import { EmbeddingsParams } from "../types";

const ALLOWED_INPUT_TYPES = [
  "search_document",
  "search_query",
  "classification",
  "clustering",
] as const;

/**
 * Turn text into vectors. Alle-AI does not store the embeddings.
 */
class AlleEmbeddings {
  private makeRequest: (endpoint: string, body: object) => Promise<any>;

  constructor(makeRequest: (endpoint: string, body: object) => Promise<any>) {
    this.makeRequest = makeRequest;
  }

  /**
   * Create embeddings for one string or a batch of strings.
   */
  async create(params: EmbeddingsParams): Promise<any> {
    if (params == null || params.input == null) {
      throw new ValidationError("input is required");
    }

    const texts = Array.isArray(params.input) ? params.input : [params.input];
    if (
      texts.length === 0 ||
      texts.length > 32 ||
      !texts.every((item) => typeof item === "string")
    ) {
      throw new ValidationError("input must be 1–32 string(s)");
    }
    texts.forEach((text, index) => {
      if (!text.trim()) {
        throw new ValidationError(`input[${index}] must be a non-empty string`);
      }
    });

    const inputType = params.input_type ?? "search_document";
    if (!ALLOWED_INPUT_TYPES.includes(inputType as (typeof ALLOWED_INPUT_TYPES)[number])) {
      throw new ValidationError(
        `input_type must be one of: ${ALLOWED_INPUT_TYPES.join(", ")}`
      );
    }

    return this.makeRequest("/embeddings", {
      input: params.input,
      model: params.model ?? "cohere-embed-v4",
      input_type: inputType,
    });
  }
}

export { AlleEmbeddings };
