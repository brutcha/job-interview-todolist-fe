import { type ChangeEvent, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  BrushCleaningIcon,
  PencilIcon,
  SendHorizontalIcon,
  SquareCheckBigIcon,
  SquareIcon,
  SquarePenIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { ScreenReader } from "@/components/screen-reader";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

import { todoApi } from "@/api/todo-api";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useDebouncedMutation } from "@/hooks/use-debounced-mutation";
import { cn } from "@/lib/utils";
import type { Task } from "@/schemas/api";
import type { State } from "@/store/store";
import { userStateSlice } from "@/store/user-state-slice";

import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";

interface TaskListItemProps {
  task: Task;
  isFetching: boolean;
}

export const TaskListItem = ({ task, isFetching }: TaskListItemProps) => {
  const editingTaskID = useSelector(
    (state: State) => state.userState.editingTaskID,
  );
  const inputValue = useSelector(
    (state: State) => state.userState.editingTaskText,
  );
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const { id, text, completed } = task;

  const [completeTask, { isLoading: isCompleting }] = useDebouncedMutation(
    todoApi.useCompleteTaskMutation,
  );
  const [incompleteTask, { isLoading: isIncompleting }] = useDebouncedMutation(
    todoApi.useIncompleteTaskMutation,
  );
  const [deleteTask, { isLoading: isDeleting }] = useDebouncedMutation(
    todoApi.useDeleteTaskMutation,
  );
  const [updateTask, { isLoading: isUpdating }] = useDebouncedMutation(
    todoApi.useUpdateTaskMutation,
  );

  const [onSubmit, isDebouncedSubmiting] = useDebouncedCallback(
    async () => {
      if (inputValue === text) {
        dispatch(userStateSlice.actions.clearEditingTask());
        return;
      }

      try {
        await updateTask([id, { text: inputValue ?? "" }]);
        toast.success("Task updated");
      } catch {
        toast.error("Failed to update task");
      }
    },
    { minLoadingTime: 50 },
  );

  const isSubmitting = isUpdating || isDebouncedSubmiting;

  const isBusy =
    isFetching ||
    isCompleting ||
    isIncompleting ||
    isDeleting ||
    isSubmitting;
  const isEditing = isSubmitting || editingTaskID === id;

  const statusMessage = (() => {
    if (isDeleting) {
      return "Deleting task";
    }
    if (isCompleting) {
      return "Marking as complete";
    }
    if (isIncompleting) {
      return "Marking as incomplete";
    }
    return null;
  })();

  const CheckboxIcon = (() => {
    if (isCompleting || isIncompleting) {
      return Spinner;
    }
    if (completed) {
      return SquareCheckBigIcon;
    }
    return SquareIcon;
  })();

  const DeleteIcon = (() => {
    if (isDeleting) {
      return Spinner;
    }
    return Trash2Icon;
  })();

  const SubmitIcon = (() => {
    if (isSubmitting) {
      return Spinner;
    }
    return SendHorizontalIcon;
  })();

  const onCheckedChange = async () => {
    try {
      if (completed) {
        await incompleteTask(id);
        toast.success("Task marked as incomplete");
      } else {
        await completeTask(id);
        toast.success("Task completed");
      }
    } catch {
      toast.error("Failed to update task");
    }
  };

  const onDelete = async () => {
    try {
      await deleteTask(id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const onEditToggle = () => {
    dispatch(userStateSlice.actions.editTask({ taskID: id, taskText: text }));
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(
      userStateSlice.actions.editTask({
        taskID: id,
        taskText: event.target.value,
      }),
    );
  };

  return (
    <>
      {/* Screen reader announcement for actions */}
      {statusMessage && <ScreenReader>{statusMessage}</ScreenReader>}

      <Item
        variant={isBusy ? "muted" : "outline"}
        aria-busy={isBusy}
        className={cn("bg-card shadow-sm", isEditing && "p-0")}
      >
        {!isEditing && (
          <>
            <ItemMedia>
              <Button
                id={id}
                variant="ghost"
                size="icon"
                role="checkbox"
                disabled={isBusy}
                aria-checked={completed}
                aria-busy={isBusy}
                aria-label={`Mark "${text}" as ${completed ? "incomplete" : "complete"}`}
                onClick={onCheckedChange}
              >
                <CheckboxIcon aria-hidden className="size-6" />
              </Button>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{text}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <ButtonGroup>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    disabled={isBusy}
                    aria-label="Delete Task"
                    aria-busy={isBusy}
                  >
                    <DeleteIcon aria-hidden className="size-6" />
                  </Button>
                )}
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onEditToggle}
                    disabled={isBusy}
                    aria-label="Edit Task"
                    aria-busy={isBusy}
                  >
                    <PencilIcon aria-hidden className="size-6" />
                  </Button>
                )}
              </ButtonGroup>
            </ItemActions>
          </>
        )}
        {isEditing && (
          <ItemContent>
            <InputGroup className="group border-none shadow-none h-19">
              <InputGroupInput
                ref={inputRef}
                value={inputValue ?? text}
                onChange={onInputChange}
                onBlur={onSubmit}
                className="font-medium border-none shadow-none -mt-0.5"
              />
              <InputGroupAddon aria-hidden>
                <div className="w-13 mr-1 flex justify-center">
                  <SquarePenIcon className="size-6 text-primary" />
                </div>
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                {" "}
                <Button
                  variant="outline"
                  size="icon-lg"
                  onClick={onSubmit}
                  disabled={isBusy}
                  aria-label="Update Task"
                  aria-busy={isBusy}
                  className="mx-2"
                >
                  <SubmitIcon aria-hidden className="size-6 text-foreground" />
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </ItemContent>
        )}
      </Item>
    </>
  );
};

interface SkeletonTaskListItemProps {
  className?: string;
}

export const SkeletonTaskListItem = ({
  className,
}: SkeletonTaskListItemProps) => {
  return (
    <Item
      variant="outline"
      className={cn("bg-card shadow-sm", className)}
      aria-hidden
      aria-busy
    >
      <ItemContent>
        <Skeleton className="w-full h-9" />
      </ItemContent>
    </Item>
  );
};

export const EmptyTaskListItem = () => {
  return (
    <Item variant="muted" className="shadow-sm">
      <ItemMedia aria-hidden>
        <BrushCleaningIcon />
      </ItemMedia>
      <ItemContent>You have no tasks.</ItemContent>
    </Item>
  );
};
