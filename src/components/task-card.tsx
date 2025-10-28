import { type ChangeEvent, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Either } from "effect";
import {
  PencilIcon,
  SendHorizontalIcon,
  SquareCheckBigIcon,
  SquareIcon,
  SquarePenIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { ScreenReader } from "@/components/screen-reader";
import { TaskButton } from "@/components/task-button";
import { TaskIcon } from "@/components/task-icon";
import {
  TaskInputGroup,
  TaskInputGroupButtonAddon,
  TaskInputGroupIconAddon,
  TaskInputGroupInput,
} from "@/components/task-input-item";
import { TaskItem } from "@/components/task-item";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";

import { todoApi } from "@/api/todo-api";
import { useDebouncedMutation } from "@/hooks/use-debounced-mutation";
import { cn } from "@/lib/utils";
import type { Task } from "@/schemas/api";
import { CallFailed } from "@/schemas/model";
import type { State } from "@/store/store";
import { userStateSlice } from "@/store/user-state-slice";

interface TaskCardProps {
  task: Task;
  isFetching: boolean;
}

export const TaskCard = ({ task, isFetching }: TaskCardProps) => {
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
  const [deleteTask, { isLoading: isDeleting }] =
    todoApi.useDeleteTaskMutation();
  const [updateTask, { isLoading: isSubmitting }] = useDebouncedMutation(
    todoApi.useUpdateTaskMutation,
    { blocking: true },
  );

  const isBusy =
    isFetching || isCompleting || isIncompleting || isDeleting || isSubmitting;
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
    const result = completed
      ? await incompleteTask(id)
      : await completeTask(id);

    Either.match(result, {
      onLeft: (error) => {
        if (error instanceof CallFailed) {
          toast.error("Failed to update task");
        }
      },
      onRight: () => {
        toast.success(
          completed ? "Task marked as incomplete" : "Task completed",
        );
      },
    });
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

  const onSubmit = async () => {
    if (inputValue === text) {
      dispatch(userStateSlice.actions.clearEditingTask());
      return;
    }

    const result = await updateTask([id, { text: inputValue ?? "" }]);

    Either.match(result, {
      onLeft: (error) => {
        if (error instanceof CallFailed) {
          toast.error("Failed to update task");
        }
      },
      onRight: () => {
        toast.success("Task updated");
      },
    });
  };

  return (
    <>
      {/* Screen reader announcement for actions */}
      {statusMessage && <ScreenReader>{statusMessage}</ScreenReader>}

      <TaskItem
        variant={isBusy ? "muted" : "outline"}
        aria-busy={isBusy}
        className={cn("bg-card shadow-sm", isEditing && "p-0")}
      >
        {!isEditing && (
          <>
            <ItemMedia>
              <TaskButton
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
                <CheckboxIcon />
              </TaskButton>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{text}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <ButtonGroup className="-my-2">
                {!isEditing && (
                  <TaskButton
                    onClick={onDelete}
                    disabled={isBusy}
                    aria-label="Delete Task"
                    aria-busy={isBusy}
                  >
                    <DeleteIcon />
                  </TaskButton>
                )}
                {!isEditing && (
                  <TaskButton
                    onClick={onEditToggle}
                    disabled={isBusy}
                    aria-label="Edit Task"
                    aria-busy={isBusy}
                  >
                    <PencilIcon />
                  </TaskButton>
                )}
              </ButtonGroup>
            </ItemActions>
          </>
        )}
        {isEditing && (
          <ItemContent>
            <TaskInputGroup className="group">
              <TaskInputGroupInput
                ref={inputRef}
                type="text"
                value={inputValue ?? text}
                onChange={onInputChange}
                onBlur={onSubmit}
              />
              <TaskInputGroupIconAddon>
                <TaskIcon variant="foreground">
                  <SquarePenIcon />
                </TaskIcon>
              </TaskInputGroupIconAddon>
              <TaskInputGroupButtonAddon>
                <TaskButton
                  onClick={onSubmit}
                  disabled={isBusy}
                  aria-label="Update Task"
                  aria-busy={isBusy}
                  className={cn(
                    "group-focus-within:bg-primary",
                    "group-focus-within:border-primary",
                    "group-focus-within:hover:bg-primary/90",
                  )}
                >
                  <SubmitIcon className="group-focus-within:text-primary-foreground" />
                </TaskButton>
              </TaskInputGroupButtonAddon>
            </TaskInputGroup>
          </ItemContent>
        )}
      </TaskItem>
    </>
  );
};
