import { useSelector } from "react-redux";

import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";

import { EmptyTaskCard } from "@/components/empty-task-card";
import { NewTaskCard } from "@/components/new-task-card";
import { SkeletonTaskCard } from "@/components/skeleton-task-card";
import { TaskCard } from "@/components/task-card";
import { TasksFilter } from "@/components/tasks-filter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ItemGroup } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";

import { useSelectedTasks } from "@/hooks/use-selected-tasks";
import { getErrorMessage, isRetryableError } from "@/lib/error-helpers";
import { isDev } from "@/lib/is-dev";
import { cn } from "@/lib/utils";
import type { State } from "@/store/store";

import { TasksActions } from "./tasks-actions";

export const TaskList = () => {
  const shouldShowNewTask = useSelector(
    (state: State) => typeof state.userState.newTaskText === "string",
  );
  const filter = useSelector((state: State) => state.userState.filter);

  const {
    data: {
      count,
      activeCount,
      completeCount,
      items,
      visibleActiveIDs,
      visibleCompletedIDs,
    },
    error,
    isLoading,
    isFetching,
    refetch,
  } = useSelectedTasks(filter);

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
    <ItemGroup className="gap-2 mb-38 md:mb-0" aria-busy={isFetching}>
      <TasksFilter
        filter={filter}
        count={count}
        activeCount={activeCount}
        completeCount={completeCount}
      />
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
      {items.map((task) => (
        <TaskCard key={task.id} task={task} isFetching={isFetching} />
      ))}
      {!isLoading && items.length === 0 && <EmptyTaskCard filter={filter} />}
      {shouldShowNewTask && <NewTaskCard />}
      {items.length > 0 && (
        <TasksActions
          visibleActiveIDs={visibleActiveIDs}
          visibleCompletedIDs={visibleCompletedIDs}
          isLoading={isFetching}
        />
      )}
    </ItemGroup>
  );
};
