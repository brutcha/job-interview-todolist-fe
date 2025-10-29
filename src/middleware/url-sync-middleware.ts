import type { Middleware } from "@reduxjs/toolkit";
import { Option, Schema } from "effect";

import type { URLHelpers } from "@/lib/url-sync";
import { defaultURLHelpers } from "@/lib/url-sync";
import { SetFilterActionSchema } from "@/schemas/model";

export const createURLSyncMiddleware = (
  urlHelpers: URLHelpers = defaultURLHelpers,
): Middleware => {
  return () => (next) => (action) => {
    const result = next(action);

    const validatedAction = Schema.decodeUnknownOption(SetFilterActionSchema)(
      action,
    );

    if (Option.isSome(validatedAction)) {
      const newUrl = urlHelpers.setSearchParam(
        "filter",
        validatedAction.value.payload,
      );
      urlHelpers.replaceState(newUrl);
    }

    return result;
  };
};

export const URLSyncMiddleware = createURLSyncMiddleware();
