import { ValidationError } from "../core/errors";
import { ToolsExecuteParams } from "../types";

const ALLOWED_TOOLS = [
  "generate_pdf",
  "generate_docx",
  "generate_pptx",
  "generate_xlsx",
  "generate_chart",
] as const;

/**
 * Run Alle-AI built-in file tools (PDF, DOCX, PPTX, XLSX, chart).
 */
class AlleTools {
  private makeRequest: (endpoint: string, body: object) => Promise<any>;

  constructor(makeRequest: (endpoint: string, body: object) => Promise<any>) {
    this.makeRequest = makeRequest;
  }

  async execute(params: ToolsExecuteParams): Promise<any> {
    if (
      !params?.tool_name ||
      !ALLOWED_TOOLS.includes(params.tool_name as (typeof ALLOWED_TOOLS)[number])
    ) {
      throw new ValidationError(
        `tool_name must be one of: ${ALLOWED_TOOLS.join(", ")}`
      );
    }
    if (!params.arguments || typeof params.arguments !== "object") {
      throw new ValidationError("arguments must be an object");
    }

    return this.makeRequest("/tools/execute", {
      tool_name: params.tool_name,
      arguments: params.arguments,
    });
  }
}

export { AlleTools };
