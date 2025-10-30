import type { PropsWithChildren } from "react";
import { useDispatch } from "react-redux";

import { Option, Schema } from "effect";

import { TaskItem } from "@/components/task-item";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import type { DataWithAggregations } from "@/hooks/use-selected-tasks";
import { cn } from "@/lib/utils";
import { type Filter, FilterSchema } from "@/schemas/model";
import { userStateSlice } from "@/store/user-state-slice";

const ToggleGroupItemLabel = ({
  children,
  count,
}: PropsWithChildren<Pick<DataWithAggregations, "count">>) => {
  return (
    <>
      {children} ({count})
    </>
  );
};

interface Props
  extends Pick<
    DataWithAggregations,
    "count" | "activeCount" | "completeCount"
  > {
  filter: Filter;
}

export const TasksFilter = ({
  count,
  activeCount,
  completeCount,
  filter,
}: Props) => {
  const dispatch = useDispatch();

  const onChange = (value: string) => {
    const validatedValue = Schema.validateOption(FilterSchema)(value);

    if (Option.isSome(validatedValue)) {
      dispatch(userStateSlice.actions.setFilter(validatedValue.value));
    }
  };

  return (
    <TaskItem
      className={cn(
        "fixed bottom-0 left-0 right-0 px-2 justify-center bg-card",
        "md:static md:bottom-auto md:left-auto md:right-auto md:px-2",
        "md:justify-start md:bg-transparent",
      )}
    >
      <fieldset className="flex flex-row gap-2 items-center">
        <legend className="hidden md:inline-block md:float-left">
          Filter by:
        </legend>
        <ToggleGroup
          type="single"
          variant="outline"
          size="lg"
          value={filter}
          onValueChange={onChange}
        >
          <ToggleGroupItem value="all" className="bg-card min-w-27 md:min-w-16">
            <ToggleGroupItemLabel count={count}>All</ToggleGroupItemLabel>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="active"
            className="bg-card min-w-27 md:min-w-16"
          >
            <ToggleGroupItemLabel count={activeCount}>
              Active
            </ToggleGroupItemLabel>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="completed"
            className="bg-card min-w-27 md:min-w-16"
          >
            <ToggleGroupItemLabel count={completeCount}>
              Completed
            </ToggleGroupItemLabel>
          </ToggleGroupItem>
        </ToggleGroup>
      </fieldset>
    </TaskItem>
  );
};
