import type { ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";

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
import { cn } from "@/lib/utils";
import type { State } from "@/store/store";
import { userStateSlice } from "@/store/user-state-slice";

export const NewTaskCard = () => {
  const dispatch = useDispatch();
  const value = useSelector((state: State) => state.userState.newTaskText);
  const [addTask, { isLoading }] = todoApi.useCreateTaskMutation();

  const Icon = isLoading ? Spinner : SendHorizontalIcon;

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(userStateSlice.actions.editNewTask(event.target.value));
  };

  const onAdd = async () => {
    if (!value) {
      return;
    }

    try {
      await addTask({ text: value }).unwrap();
      toast.success("New task was added.");
    } catch {
      toast.error("Unable to add Task.");
    }
  };

  const onBlur = () => {
    if (value) {
      onAdd();
    } else {
      dispatch(userStateSlice.actions.clearNewTask());
    }
  };

  return (
    <Item variant="outline" className="group p-0">
      <TaskInputGroup>
        <TaskInputGroupInput
          autoFocus={true}
          value={value ?? ""}
          onChange={onChange}
          placeholder="What needs to bee done?"
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
};
