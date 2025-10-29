import { Item } from "@/components/ui/item";

import { cn } from "@/lib/utils";

interface TaskItemProps extends React.ComponentProps<typeof Item> {
  children: React.ReactNode;
}

export const TaskItem = ({ children, className, ...props }: TaskItemProps) => {
  return (
    <Item className={cn("min-h-[78px]", className)} {...props}>
      {children}
    </Item>
  );
};
