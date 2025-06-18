/**
 * Base error class for AlleAI SDK
 */
class AlleAIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AlleAIError';
  }
}

/**
 * Error for validation failures
 */
class ValidationError extends AlleAIError {
  constructor(message: string, code = "VALIDATION_ERROR", details?: any) {
    super(message, code, undefined, details);
    this.name = "ValidationError";
  }
}

/**
 * Error for API authentication issues
 */
class AuthenticationError extends AlleAIError {
  constructor(message: string, code = "AUTH_ERROR", details?: any) {
    super(message, code, 401, details);
    this.name = "AuthenticationError";
  }
}

/**
 * Error for invalid API requests
 */
class InvalidRequestError extends AlleAIError {
  constructor(message: string, code = "INVALID_REQUEST", details?: any) {
    super(message, code, 400, details);
    this.name = "InvalidRequestError";
  }
}

/**
 * Error for API rate limiting
 */
class RateLimitError extends AlleAIError {
  constructor(message: string, code = "RATE_LIMIT", details?: any) {
    super(message, code, 429, details);
    this.name = "RateLimitError";
  }
}

/**
 * Error for server/service issues
 */
class ServiceUnavailableError extends AlleAIError {
  constructor(message: string, code = "SERVICE_ERROR", details?: any) {
    super(message, code, 503, details);
    this.name = "ServiceUnavailableError";
  }
}

/**
 * Error for network/connection issues
 */
class ConnectionError extends AlleAIError {
  constructor(message: string, code = "CONNECTION_ERROR", details?: any) {
    super(message, code, undefined, details);
    this.name = "ConnectionError";
  }
}

/**
 * Generic API error
 */
class APIError extends AlleAIError {
  constructor(
    message: string,
    code = "API_ERROR",
    status?: number,
    details?: any
  ) {
    super(message, code, status, details);
    this.name = "APIError";
  }
}
export {
  AlleAIError,
  ValidationError,
  AuthenticationError,
  InvalidRequestError,
  RateLimitError,
  ServiceUnavailableError,
  ConnectionError,
  APIError
};

