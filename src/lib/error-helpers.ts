import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export type ApiError = FetchBaseQueryError | SerializedError;

/**
 * Determines if an error is retryable (network/5xx errors)
 */
export const isRetryableError = (error: ApiError): boolean => {
  if ("status" in error) {
    // Network errors
    if (error.status === "FETCH_ERROR" || error.status === "TIMEOUT_ERROR") {
      return true;
    }

    // Server errors (5xx)
    if (typeof error.status === "number" && error.status >= 500) {
      return true;
    }
  }

  return false;
};

/**
 * Extracts user-friendly error message
 */
export const getErrorMessage = (error: ApiError): string => {
  if ("status" in error) {
    // Check for custom error message in data first
    if (
      "data" in error &&
      typeof error.data === "object" &&
      error.data &&
      "message" in error.data
    ) {
      return String(error.data.message);
    }

    if (error.status === "FETCH_ERROR") {
      return "Unable to connect to server. Please check your internet connection.";
    }

    if (error.status === "TIMEOUT_ERROR") {
      return "Request timed out. Please try again.";
    }

    if (typeof error.status === "number") {
      if (error.status >= 500) {
        return "Server error. Please try again later.";
      }

      if (error.status === 404) {
        return "Resource not found.";
      }

      if (error.status === 400) {
        return "Invalid request. Please check your input.";
      }
    }
  }

  if ("message" in error && error.message) {
    return error.message;
  }

  return "An unexpected error occurred.";
};
