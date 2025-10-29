import { BrushCleaningIcon } from "lucide-react";

import { ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";

import type { Filter } from "@/schemas/model";

import { TaskIcon } from "./task-icon";
import { TaskItem } from "./task-item";

interface Props {
  filter: Filter;
}

export const EmptyTaskCard = ({ filter }: Props) => {
  return (
    <TaskItem variant="muted">
      <ItemMedia aria-hidden className="w-11">
        <TaskIcon variant="foreground">
          <BrushCleaningIcon />
        </TaskIcon>
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="text-base">
          You have no {filter !== "all" && filter} tasks.
        </ItemTitle>
      </ItemContent>
    </TaskItem>
  );
};
