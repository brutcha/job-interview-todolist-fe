import { Schema } from "effect";

export const TaskIDSchema = Schema.String.pipe(
  Schema.minLength(21),
  Schema.brand("TaskID"),
);
export type TaskID = typeof TaskIDSchema.Type;

export const TaskTextSchema = Schema.String.pipe(Schema.minLength(1));
export type TaskText = typeof TaskTextSchema.Type;

export const TaskSchema = Schema.Struct({
  id: TaskIDSchema,
  text: TaskTextSchema,
  completed: Schema.Boolean,
  createdDate: Schema.Int,
  completedDate: Schema.Int.pipe(Schema.optional),
});
export type Task = typeof TaskSchema.Type;

export const GetTasksResponseSchema = Schema.Array(TaskSchema);
export type GetTasksResponse = typeof GetTasksResponseSchema.Type;

export const UpdateTaskRequestSchema = Schema.Struct({
  text: TaskTextSchema,
});
export type UpdateTaskRequest = typeof UpdateTaskRequestSchema.Encoded;
