# Changelog

All notable changes to this project will be documented in this file.

---

## [2.1.0] - 2026-08-17

### Added
- `client.embeddings.create()` → `POST /embeddings` (`cohere-embed-v4`)
- `client.tools.execute()` → `POST /tools/execute`
- Chat `tools` on completions, plus `request_log_id` + `tool_result` follow-up

### Notes
- Public chat `stream` is still accepted and ignored (full JSON response)
- There is no public `/video/edit` endpoint

---

## [2.0.0] - 2025-06-18

### ⚠️ Breaking Changes

- 🔁 **Method Renamed**  
  The `summary(options)` method has been removed and replaced with `comparison(options)`.  
  > Update all instances of `client.summary(options)` to use `client.comparison(options)`.

- 🧱 **Client Class Renamed**  
  The main SDK client has been renamed for better clarity and consistency.

  **Before (JavaScript / TypeScript):**
  ```js
  const { AlleAi } = require("alle-ai-sdk");
  // or
  import { AlleAi } from "alle-ai-sdk";
  ```

  **After (JavaScript / TypeScript):**
  ```js
  const { AlleAIClient } = require("alle-ai-sdk");
  // or
  import { AlleAIClient } from "alle-ai-sdk";
  ```
