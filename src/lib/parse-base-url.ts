import { Either, Schema } from "effect";
import { logger } from "./logger";

const FALLBACK_URL = "http://localhost:8080";

const BaseUrlSchema = Schema.String.pipe(Schema.pattern(/^https?:\/\/.+/));

export const parseBaseURL = () => {
  const parsed = Schema.decodeUnknownEither(BaseUrlSchema)(
    import.meta.env.VITE_API_BASE_URL,
  );

  if (Either.isRight(parsed)) {
    return parsed.right;
  }

  logger.error("Failed to parse BaseURL, please check your `.env` file.");

  return FALLBACK_URL;
};
