import { BrushCleaningIcon } from "lucide-react";

import { ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";

import { TaskIcon } from "./task-icon";
import { TaskItem } from "./task-item";

export const EmptyTaskCard = () => {
  return (
    <TaskItem variant="muted">
      <ItemMedia aria-hidden className="w-11">
        <TaskIcon variant="foreground">
          <BrushCleaningIcon />
        </TaskIcon>
      </ItemMedia>
      <ItemContent><ItemTitle className="text-base">You have no tasks.</ItemTitle></ItemContent>
    </TaskItem>
  );
};
