import { Schema } from "effect";

const TextSchema = Schema.String.pipe(Schema.minLength(1));

export const TaskSchema = Schema.Struct({
  id: Schema.String.pipe(Schema.length(21), Schema.brand("TaskID")),
  text: TextSchema,
  completed: Schema.Boolean,
  createdDate: Schema.DateFromNumber,
  completedDate: Schema.DateFromNumber.pipe(Schema.optional),
});
export type Task = typeof TaskSchema.Type;

export const GetTasksResponseSchema = Schema.Array(TaskSchema);
export type GetTasksResponse = typeof GetTasksResponseSchema.Type;
