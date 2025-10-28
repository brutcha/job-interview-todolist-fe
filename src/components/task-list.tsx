import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";

import { EmptyTaskCard } from "@/components/empty-task-card";
import { NewTaskCard } from "@/components/new-task-card";
import { ScreenReader } from "@/components/screen-reader";
import { SkeletonTaskCard } from "@/components/skeleton-task-card";
import { TaskCard } from "@/components/task-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ItemGroup } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";

import { todoApi } from "@/api/todo-api";
import { getErrorMessage, isRetryableError } from "@/lib/error-helpers";
import { isDev } from "@/lib/is-dev";
import { cn } from "@/lib/utils";

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
            <SkeletonTaskCard
              key={`skeleton-${index}`}
              className={cn({
                "opacity-75": index === 1,
                "opacity-50": index === 2,
                "opacity-25": index === 3,
              })}
            />
          ))}
        {data?.map((task) => (
          <TaskCard key={task.id} task={task} isFetching={isFetching} />
        ))}
        {data?.length === 0 && <EmptyTaskCard />}
        <NewTaskCard />
      </ItemGroup>
    </>
  );
};
