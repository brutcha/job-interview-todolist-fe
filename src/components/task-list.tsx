import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";

import {
  EmptyTaskListItem,
  SkeletonTaskListItem,
  TaskListItem,
} from "@/components/task-list-item";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ItemGroup } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";

import { todoApi } from "@/api/todo-api";
import { getErrorMessage, isRetryableError } from "@/lib/error-helpers";
import { isDev } from "@/lib/is-dev";
import { cn } from "@/lib/utils";

import { ScreenReader } from "./screen-reader";

export const TaskList = () => {
  const { data, error, isLoading, isFetching, refetch } =
    todoApi.useGetTasksQuery();

  const taskCount = data?.length ?? 0;
  const statusMessage = isFetching
    ? "Loading tasks..."
    : `${taskCount} task${taskCount === 1 ? "" : "s"}`;

  if (error) {
    const showRetry = isRetryableError(error);
    const errorMessage = getErrorMessage(error);

    return (
      <Alert variant="destructive">
        <AlertCircleIcon aria-hidden />
        <AlertTitle>Unable to load your tasks.</AlertTitle>
        <AlertDescription>
          <p>{errorMessage}</p>
          {isDev() && (
            <pre className="mt-2 text-xs">{JSON.stringify(error, null, 2)}</pre>
          )}
          {showRetry && (
            <Button onClick={refetch} aria-busy={isFetching} className="mt-2">
              {isFetching ? (
                <Spinner aria-hidden />
              ) : (
                <RefreshCwIcon aria-hidden />
              )}
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <ScreenReader aria-atomic="true">{statusMessage}</ScreenReader>

      <ItemGroup className="gap-2" aria-busy={isFetching}>
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <SkeletonTaskListItem
              key={`skeleton-${index}`}
              className={cn({
                "opacity-75": index === 1,
                "opacity-50": index === 2,
                "opacity-25": index === 3,
              })}
            />
          ))}
        {data?.map((task) => (
          <TaskListItem key={task.id} task={task} isFetching={isFetching} />
        ))}
        {data?.length === 0 && <EmptyTaskListItem />}
      </ItemGroup>
    </>
  );
};
