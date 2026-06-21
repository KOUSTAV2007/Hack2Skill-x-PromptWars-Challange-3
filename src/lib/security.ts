/**
 * Security utility for input validation and sanitization.
 * Prevents prompt injections, system instructional bypasses, and XSS patterns.
 */

// Basic escape function for XSS prevention
export function sanitizeHTML(input: string): string {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Common patterns for prompt injection/system jailbreaks
const BLACKLISTED_PROMPT_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /ignore\s+above/i,
  /system\s+override/i,
  /you\s+are\s+now\s+an\s+admin/i,
  /forget\s+all\s+constraints/i,
  /bypass\s+restrictions/i,
  /dan\s+mode/i,
  /jailbreak/i,
  /acting\s+as\s+a\s+unrestricted/i,
  /ignore\s+the\s+system/i,
  /rewrite\s+the\s+original\s+prompt/i,
];

export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  errorMessage?: string;
}

export function validateAndSanitizePrompt(prompt: string): ValidationResult {
  if (!prompt || prompt.trim() === "") {
    return { isValid: true, sanitized: "" };
  }

  // 1. Level 1: Length Validation
  if (prompt.length > 3000) {
    return {
      isValid: false,
      sanitized: "",
      errorMessage: "Input exceeds maximum allowed safety length of 3000 characters."
    };
  }

  // 2. Level 2: Injection check
  for (const pattern of BLACKLISTED_PROMPT_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        isValid: false,
        sanitized: "",
        errorMessage: "Potential prompt bypass or injection signature detected! Please focus your prompt on sustainable carbon calculations."
      };
    }
  }

  // 3. Level 3: XSS / Script sanitization
  // Strip script tags entirely
  let clean = prompt.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // Strip onload/onerror etc handlers
  clean = clean.replace(/on\w+\s*=\s*".*?"/gi, "");
  clean = clean.replace(/on\w+\s*=\s*'.*?'/gi, "");
  
  // HTML-escape to protect rendering
  const escaped = sanitizeHTML(clean);

  return {
    isValid: true,
    sanitized: escaped
  };
}
