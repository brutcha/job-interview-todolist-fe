import { ItemContent } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";

import { TaskItem } from "./task-item";

interface SkeletonTaskCardProps {
  className?: string;
}

export const SkeletonTaskCard = ({ className }: SkeletonTaskCardProps) => {
  return (
    <TaskItem
      variant="outline"
      className={cn("bg-card shadow-sm", className)}
      aria-hidden
      aria-busy
    >
      <ItemContent>
        <Skeleton className="w-full h-8" />
      </ItemContent>
    </TaskItem>
  );
};
