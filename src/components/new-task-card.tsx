import type { ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Either } from "effect";
import { SendHorizontalIcon, SquarePlusIcon } from "lucide-react";
import { toast } from "sonner";

import { TaskButton } from "@/components/task-button";
import { TaskIcon } from "@/components/task-icon";
import {
  TaskInputGroup,
  TaskInputGroupButtonAddon,
  TaskInputGroupIconAddon,
  TaskInputGroupInput,
} from "@/components/task-input-item";
import { Item } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";

import { todoApi } from "@/api/todo-api";
import { useDebouncedMutation } from "@/hooks/use-debounced-mutation";
import { cn } from "@/lib/utils";
import { CallFailed } from "@/schemas/model";
import type { State } from "@/store/store";
import { userStateSlice } from "@/store/user-state-slice";

export const NewTaskCard = () => {
  const dispatch = useDispatch();
  const value = useSelector((state: State) => state.userState.newTaskText);
  const [addTask, { isLoading }] = useDebouncedMutation(
    todoApi.useCreateTaskMutation,
    { blocking: true },
  );

  const Icon = isLoading ? Spinner : SendHorizontalIcon;

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(userStateSlice.actions.editNewTask(event.target.value));
  };

  const onAdd = async () => {
    if (!value) {
      return;
    }

    const result = await addTask({ text: value });

    Either.match(result, {
      onRight() {
        toast.success("New task was added.");
        //dispatch(userStateSlice.actions.clearNewTask());
      },
      onLeft(error) {
        if (error instanceof CallFailed) {
          toast.error("Unable to add Task.");
        }
      },
    });
  };

  const onBlur = () => {
    if (value) {
      onAdd();
    } else {
      dispatch(userStateSlice.actions.clearNewTask());
    }
  };

  if (typeof value === "string") {
    return (
      <Item variant="outline" className="group p-0">
        <TaskInputGroup>
          <TaskInputGroupInput
            autoFocus={true}
            value={value}
            onChange={onChange}
            placeholder="What's needs to bee done?"
            className="text-base"
            onBlur={onBlur}
          />
          <TaskInputGroupIconAddon>
            <TaskIcon variant="foreground">
              <SquarePlusIcon />
            </TaskIcon>
          </TaskInputGroupIconAddon>
          {value && (
            <TaskInputGroupButtonAddon>
              <TaskButton
                onClick={onAdd}
                disabled={isLoading}
                aria-busy={isLoading}
                aria-description="Create task"
                className={cn(
                  "group-focus-within:bg-primary",
                  "group-focus-within:border-primary",
                  "group-focus-within:hover:bg-primary/90",
                )}
              >
                <Icon className="group-focus-within:text-primary-foreground" />
              </TaskButton>
            </TaskInputGroupButtonAddon>
          )}
        </TaskInputGroup>
      </Item>
    );
  }

  return null;
};
