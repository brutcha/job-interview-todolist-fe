import { todoApi } from "@/api/todo-api";
import type { Filter } from "@/schemas/model";

export const useSelectedTasks = (filter: Filter) => {
  return todoApi.useGetTasksQuery(undefined, {
    selectFromResult: ({ data, ...rest }) => ({
      data:
        filter === "all"
          ? data
          : data?.filter(({ completed }) =>
              filter === "completed" ? completed : !completed,
            ),
      ...rest,
    }),
  });
};
