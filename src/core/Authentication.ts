
interface AuthResponse {
  token: string;
}

async function authenticate(
  apiKey: string,
  baseUrl: string
): Promise<AuthResponse> {
  if (!apiKey) throw new Error("API key is required");
  if (!baseUrl) throw new Error("Base URL is required");

  const response = await fetch(`${baseUrl}/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ apiKey }),
  });

  if (!response.ok)
    throw new Error(`Authentication failed: ${response.status}`);

  const data: AuthResponse = await response.json();
  if (!data.token)
    throw new Error("No token received from authentication endpoint");

  return data;
}

export { authenticate, AuthResponse };
