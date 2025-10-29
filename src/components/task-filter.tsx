import { useDispatch, useSelector } from "react-redux";

import { TaskItem } from "@/components/task-item";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { cn } from "@/lib/utils";
import type { Filter } from "@/schemas/model";
import type { State } from "@/store/store";
import { userStateSlice } from "@/store/user-state-slice";

export const TasksFilter = () => {
  const value = useSelector((state: State) => state.userState.filter);
  const dispatch = useDispatch();

  const onChange = (value: Filter) => {
    dispatch(userStateSlice.actions.setFilter(value));
  };

  return (
    <TaskItem
      variant="muted"
      className={cn(
        "fixed bottom-0 left-0 right-0 px-2 justify-center bg-card",
        "md:static md:bottom-auto md:left-auto md:right-auto md:px-2",
        "md:justify-start md:bg-muted",
      )}
    >
      <label htmlFor="tasks-filter" className="hidden md:block">
        Filter by:
      </label>
      <ToggleGroup
        id="tasks-filter"
        type="single"
        variant="outline"
        size="lg"
        value={value}
        onValueChange={onChange}
      >
        <ToggleGroupItem value="all" className="bg-card min-w-27 md:min-w-16">
          All
        </ToggleGroupItem>
        <ToggleGroupItem
          value="active"
          className="bg-card min-w-27 md:min-w-16"
        >
          Active
        </ToggleGroupItem>
        <ToggleGroupItem
          value="completed"
          className="bg-card min-w-27 md:min-w-16"
        >
          Completed
        </ToggleGroupItem>
      </ToggleGroup>
    </TaskItem>
  );
};
