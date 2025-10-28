import type {
  BaseQueryApi,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Either, Schema } from "effect";

import { parseBaseURL } from "@/lib/parse-base-url";
import {
  type CreateTaskRequest,
  CreateTaskRequestSchema,
  type GetTasksResponse,
  GetTasksResponseSchema,
  type Task,
  type TaskID,
  TaskSchema,
  type UpdateTaskRequest,
  UpdateTaskRequestSchema,
} from "@/schemas/api";
import { userStateSlice } from "@/store/user-state-slice";

export const debouncedQueryFn = <TArgs, TResult, TEncoded = TResult>(
  query: (args: TArgs) => string | FetchArgs,
  responseSchema: Schema.Schema<TResult, TEncoded, never>,
  debounceMs = 250,
) => {
  return async (
    args: TArgs,
    _api: BaseQueryApi,
    _extraOptions: unknown,
    baseQuery: (
      arg: string | FetchArgs,
    ) => Promise<
      QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>
    >,
  ): Promise<
    QueryReturnValue<
      TResult,
      FetchBaseQueryError,
      FetchBaseQueryMeta | undefined
    >
  > => {
    const [result] = await Promise.all([
      baseQuery(query(args)),
      new Promise((resolve) => setTimeout(resolve, debounceMs)),
    ]);

    if ("error" in result) {
      return result as QueryReturnValue<
        TResult,
        FetchBaseQueryError,
        FetchBaseQueryMeta | undefined
      >;
    }

    return Either.match(
      Schema.decodeUnknownEither(responseSchema)(result.data),
      {
        onLeft(error) {
          return {
            error: {
              status: "PARSING_ERROR",
              originalStatus: result.meta?.response?.status,
              error: String(error),
              data: result.data,
            } as FetchBaseQueryError,
          };
        },
        onRight(data) {
          return { data };
        },
      },
    );
  };
};

export const handleTaskUpdate = async <T extends (action: unknown) => unknown>(
  taskID: TaskID,
  dispatch: T,
  queryFulfilled: Promise<{ data: Task }>,
  options?: { clearEditingTask?: boolean },
) => {
  const { data } = await queryFulfilled;

  dispatch(
    todoApi.util.updateQueryData(
      "getTasks",
      undefined,
      (draft: GetTasksResponse) =>
        draft.map((task) => (task.id === taskID ? data : task)),
    ),
  );

  if (options?.clearEditingTask) {
    dispatch(userStateSlice.actions.clearEditingTask());
  }
};

export const handleTaskDelete = async <T extends (action: unknown) => unknown>(
  taskID: TaskID,
  dispatch: T,
  queryFulfilled: Promise<unknown>,
  minWaitTime = 250,
) => {
  await Promise.all([
    queryFulfilled,
    new Promise((resolve) => setTimeout(resolve, minWaitTime)),
  ]);

  dispatch(
    todoApi.util.updateQueryData(
      "getTasks",
      undefined,
      (draft: GetTasksResponse) => draft.filter((task) => task.id !== taskID),
    ),
  );
};

export const handleTaskCreate = async <T extends (action: unknown) => unknown>(
  dispatch: T,
  queryFulfilled: Promise<{ data: Task }>,
) => {
  const { data } = await queryFulfilled;

  dispatch(userStateSlice.actions.clearNewTask());
  dispatch(
    todoApi.util.updateQueryData(
      "getTasks",
      undefined,
      (draft: GetTasksResponse) => [...draft, data],
    ),
  );
};

export const todoApi = createApi({
  reducerPath: "todoApi",
  baseQuery: fetchBaseQuery({
    baseUrl: parseBaseURL(),
  }),
  tagTypes: ["Task"],
  endpoints(build) {
    return {
      getTasks: build.query<GetTasksResponse, void>({
        query: () => "/tasks",
        transformResponse(response: unknown) {
          return Schema.decodeUnknownSync(GetTasksResponseSchema)(response);
        },
      }),
      createTask: build.mutation<Task, CreateTaskRequest>({
        queryFn: debouncedQueryFn((body) => ({
          url: "/tasks",
          method: "POST",
          body: Schema.encodeSync(CreateTaskRequestSchema)(body),
        }), TaskSchema),
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          handleTaskCreate(dispatch, queryFulfilled);
        },
      }),
      updateTask: build.mutation<
        Task,
        [taskID: TaskID, body: UpdateTaskRequest]
      >({
        queryFn: debouncedQueryFn(([taskID, body]) => ({
          url: `/tasks/${taskID}`,
          method: "POST",
          body: Schema.encodeSync(UpdateTaskRequestSchema)(body),
        }), TaskSchema),
        async onQueryStarted([taskID], { dispatch, queryFulfilled }) {
          await handleTaskUpdate(taskID, dispatch, queryFulfilled, {
            clearEditingTask: true,
          });
        },
      }),
      completeTask: build.mutation<Task, TaskID>({
        queryFn: debouncedQueryFn((taskID) => ({
          url: `tasks/${taskID}/complete`,
          method: "POST",
        }), TaskSchema),
        async onQueryStarted(taskID, { dispatch, queryFulfilled }) {
          await handleTaskUpdate(taskID, dispatch, queryFulfilled);
        },
      }),
      incompleteTask: build.mutation<Task, TaskID>({
        queryFn: debouncedQueryFn(
          (taskID: TaskID) => ({
            url: `tasks/${taskID}/incomplete`,
            method: "POST",
          }),
          TaskSchema,
        ),
        async onQueryStarted(taskID, { dispatch, queryFulfilled }) {
          await handleTaskUpdate(taskID, dispatch, queryFulfilled);
        },
      }),
      deleteTask: build.mutation<void, TaskID>({
        queryFn: debouncedQueryFn(
          (taskID) => ({
            url: `tasks/${taskID}`,
            method: "DELETE",
          }),
          Schema.Void,
        ),
        async onQueryStarted(TaskID, { dispatch, queryFulfilled }) {
          await handleTaskDelete(TaskID, dispatch, queryFulfilled);
        },
      }),
    };
  },
});
