import { useSelector } from "react-redux";

import { CheckIcon, XIcon } from "lucide-react";

import { todoApi } from "@/api/todo-api";
import type { DataWithAggregations } from "@/hooks/use-selected-tasks";
import { createBulkHandler, createRequestStatus } from "@/lib/request-helpers";
import { selectRunningOperations } from "@/store/store";

import { ScreenReader } from "./screen-reader";
import { TaskIcon } from "./task-icon";
import { TaskItem } from "./task-item";
import { Button } from "./ui/button";
import { ItemActions, ItemMedia, ItemTitle } from "./ui/item";
import { Spinner } from "./ui/spinner";

type Props = Pick<
  DataWithAggregations,
  "visibleActiveIDs" | "visibleCompletedIDs"
> & {
  isLoading?: boolean;
};

export const TasksActions = ({
  visibleCompletedIDs,
  visibleActiveIDs,
  isLoading = false,
}: Props) => {
  const [completeTask] = todoApi.useCompleteTaskMutation();
  const [deleteTask] = todoApi.useDeleteTaskMutation();
  const runningMutations = useSelector(selectRunningOperations);
  const isBusy =
    isLoading ||
    runningMutations.READ > 0 ||
    runningMutations.CREATE > 0 ||
    runningMutations.UPDATE > 0 ||
    runningMutations.DELETE > 0;

  const handleBulkComplete = createBulkHandler(
    (taskID) => completeTask(taskID).unwrap(),
    (succeeded) => `${succeeded} task${succeeded > 1 ? "s" : ""} completed`,
    (failed) => `${failed} task${failed > 1 ? "s" : ""} failed`,
    visibleActiveIDs,
  );

  const handleBulkDelete = createBulkHandler(
    (taskID) => deleteTask(taskID).unwrap(),
    (succeeded) => `${succeeded} task${succeeded > 1 ? "s" : ""} deleted`,
    (failed) => `${failed} task${failed > 1 ? "s" : ""} failed`,
    visibleCompletedIDs,
  );

  return (
    <TaskItem className="py-0 items-start">
      <ItemActions className="flex-col items-start -ml-2 md:flex-row md:items-center">
        {visibleCompletedIDs.length > 0 && (
          <Button
            variant="link"
            disabled={isBusy}
            aria-busy={isBusy}
            onClick={handleBulkDelete}
          >
            <XIcon aria-hidden />
            Remove completed tasks ({visibleCompletedIDs.length})
          </Button>
        )}
        {visibleActiveIDs.length > 0 && (
          <Button
            variant="link"
            disabled={isBusy}
            aria-busy={isBusy}
            onClick={handleBulkComplete}
          >
            <CheckIcon aria-hidden />
            Complete all tasks ({visibleActiveIDs.length})
          </Button>
        )}
      </ItemActions>
      <ItemTitle className="flex-1">
        <ScreenReader aria-atomic="true">
          {createRequestStatus("READ", runningMutations.READ)}
          {createRequestStatus("CREATE", runningMutations.CREATE)}
          {createRequestStatus("UPDATE", runningMutations.UPDATE)}
          {createRequestStatus("DELETE", runningMutations.DELETE)}
        </ScreenReader>
      </ItemTitle>
      {isBusy && (
        <ItemMedia>
          <TaskIcon>
            <Spinner />
          </TaskIcon>
        </ItemMedia>
      )}
    </TaskItem>
  );
};
