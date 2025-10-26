import { parseBaseURL } from "@/lib/parseBaseURL";
import { GetTasksResponseSchema } from "@/schemas/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Schema } from "effect";

export const todoApi = createApi({
  reducerPath: "todoApi",
  baseQuery: fetchBaseQuery({
    baseUrl: parseBaseURL(),
  }),
  endpoints(build) {
    return {
      getTasks: build.query({
        query: () => "/tasks",
        transformResponse(response) {
          return Schema.decodeUnknownSync(GetTasksResponseSchema)(response);
        },
      }),
    };
  },
});
