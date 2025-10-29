import { useSelector } from "react-redux";

import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";

import { EmptyTaskCard } from "@/components/empty-task-card";
import { NewTaskCard } from "@/components/new-task-card";
import { ScreenReader } from "@/components/screen-reader";
import { SkeletonTaskCard } from "@/components/skeleton-task-card";
import { TaskCard } from "@/components/task-card";
import { TasksFilter } from "@/components/task-filter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ItemGroup } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";

import { useSelectedTasks } from "@/hooks/use-selected-tasks";
import { getErrorMessage, isRetryableError } from "@/lib/error-helpers";
import { isDev } from "@/lib/is-dev";
import { cn } from "@/lib/utils";
import type { State } from "@/store/store";

export const TaskList = () => {
  const shouldShowNewTask = useSelector(
    (state: State) => typeof state.userState.newTaskText === "string",
  );
  const filter = useSelector((state: State) => state.userState.filter);

  const { data, error, isLoading, isFetching, refetch } =
    useSelectedTasks(filter);

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
        <TasksFilter />
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
        {shouldShowNewTask && <NewTaskCard />}
      </ItemGroup>
    </>
  );
};
