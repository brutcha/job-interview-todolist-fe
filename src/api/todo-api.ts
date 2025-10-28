import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Schema } from "effect";

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

export const handleTaskUpdate = async <T extends (action: unknown) => unknown>(
  taskID: TaskID,
  dispatch: T,
  queryFulfilled: Promise<{ data: Task }>,
  options?: { clearEditingTask?: boolean },
) => {
  const { data } = await queryFulfilled;

  dispatch(
    todoApi.util.updateQueryData("getTasks", undefined, (draft) =>
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
    todoApi.util.updateQueryData("getTasks", undefined, (draft) =>
      draft.filter((task) => task.id !== taskID),
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
    todoApi.util.updateQueryData("getTasks", undefined, (draft) => [
      ...draft,
      data,
    ]),
  );
};

export const todoApi = createApi({
  reducerPath: "todoApi",
  baseQuery: fetchBaseQuery({
    baseUrl: parseBaseURL(),
  }),
  endpoints(build) {
    return {
      getTasks: build.query<GetTasksResponse, void>({
        query: () => "/tasks",
        transformResponse(response: unknown) {
          return Schema.decodeUnknownSync(GetTasksResponseSchema)(response);
        },
      }),
      createTask: build.mutation<Task, CreateTaskRequest>({
        query: (body) => ({
          url: "/tasks",
          method: "POST",
          body: Schema.encodeSync(CreateTaskRequestSchema)(body),
        }),
        transformResponse(response: unknown) {
          return Schema.decodeUnknownSync(TaskSchema)(response);
        },
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          handleTaskCreate(dispatch, queryFulfilled);
        },
      }),
      updateTask: build.mutation<
        Task,
        [taskID: TaskID, body: UpdateTaskRequest]
      >({
        query: ([taskID, body]) => ({
          url: `tasks/${taskID}`,
          method: "POST",
          body: Schema.encodeSync(UpdateTaskRequestSchema)(body),
        }),
        transformResponse(response: unknown) {
          return Schema.decodeUnknownSync(TaskSchema)(response);
        },
        async onQueryStarted([taskID], { dispatch, queryFulfilled }) {
          await handleTaskUpdate(taskID, dispatch, queryFulfilled, {
            clearEditingTask: true,
          });
        },
      }),
      completeTask: build.mutation<Task, TaskID>({
        query: (taskID) => ({
          url: `tasks/${taskID}/complete`,
          method: "POST",
        }),
        transformResponse(response: unknown) {
          return Schema.decodeUnknownSync(TaskSchema)(response);
        },
        async onQueryStarted(taskID, { dispatch, queryFulfilled }) {
          await handleTaskUpdate(taskID, dispatch, queryFulfilled);
        },
      }),
      incompleteTask: build.mutation<Task, TaskID>({
        query: (taskID) => ({
          url: `tasks/${taskID}/incomplete`,
          method: "POST",
        }),
        transformResponse(response: unknown) {
          return Schema.decodeUnknownSync(TaskSchema)(response);
        },
        async onQueryStarted(taskID, { dispatch, queryFulfilled }) {
          await handleTaskUpdate(taskID, dispatch, queryFulfilled);
        },
      }),
      deleteTask: build.mutation<string, TaskID>({
        query: (taskID) => ({
          url: `tasks/${taskID}`,
          method: "DELETE",
        }),
        async onQueryStarted(taskID, { dispatch, queryFulfilled }) {
          await handleTaskDelete(taskID, dispatch, queryFulfilled);
        },
      }),
    };
  },
});
