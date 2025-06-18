# Changelog

All notable changes to this project will be documented in this file.

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
