import { ApiError } from "@/lib/api";

export function email(value: unknown) {
  const result = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result) || result.length > 200) {
    throw new ApiError("Enter a valid email address");
  }

  return result;
}

export function required(value: unknown, label: string, max = 200) {
  const result = typeof value === "string" ? value.trim() : "";

  if (!result) {
    throw new ApiError(`${label} is required`);
  }

  if (result.length > max) {
    throw new ApiError(`${label} is too long`);
  }

  return result;
}

// Passwords are passed to Cognito exactly as typed.
export function password(value: unknown) {
  if (typeof value !== "string" || value.length === 0) {
    throw new ApiError("Password is required");
  }

  if (value.length > 256) {
    throw new ApiError("Password is too long");
  }

  return value;
}
