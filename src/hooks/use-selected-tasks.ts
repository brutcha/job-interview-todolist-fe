import { todoApi } from "@/api/todo-api";
import type { Task, TaskID } from "@/schemas/api";
import type { Filter } from "@/schemas/model";

export interface DataWithAggregations {
  readonly items: Task[];
  readonly count: number;
  readonly activeCount: number;
  readonly completeCount: number;
  readonly visibleActiveIDs: TaskID[];
  readonly visibleCompletedIDs: TaskID[];
}

const initDataWithAggregations: DataWithAggregations = {
  items: [],
  count: 0,
  activeCount: 0,
  completeCount: 0,
  visibleActiveIDs: [],
  visibleCompletedIDs: [],
};

export const useSelectedTasks = (filter: Filter) => {
  return todoApi.useGetTasksQuery(undefined, {
    selectFromResult: ({ data, ...rest }) => ({
      data: (data ?? []).reduce(
        (
          {
            items,
            count,
            activeCount,
            completeCount,
            visibleActiveIDs,
            visibleCompletedIDs,
          },
          task,
        ) => {
          const shouldInclude =
            filter === "all" ||
            (filter === "completed" && task.completed) ||
            (filter === "active" && !task.completed);

          const activeIDs =
            shouldInclude && !task.completed
              ? [...visibleActiveIDs, task.id]
              : visibleActiveIDs;

          const completedIDs =
            shouldInclude && task.completed
              ? [...visibleCompletedIDs, task.id]
              : visibleCompletedIDs;

          return {
            items: shouldInclude ? [...items, task] : items,
            count: count + 1,
            activeCount: activeCount + (task.completed ? 0 : 1),
            completeCount: completeCount + (task.completed ? 1 : 0),
            visibleActiveIDs: activeIDs,
            visibleCompletedIDs: completedIDs,
          };
        },
        initDataWithAggregations,
      ),
      ...rest,
    }),
  });
};
