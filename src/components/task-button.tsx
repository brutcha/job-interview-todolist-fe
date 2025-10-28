import { type VariantProps } from "class-variance-authority";

import { TaskIcon } from "@/components/task-icon";
import { Button, buttonVariants } from "@/components/ui/button";

export const TaskButton = ({
  className,
  variant = "outline",
  size = "icon-lg",
  children,
  ...props
}: React.ComponentProps<typeof Button> &
  VariantProps<typeof buttonVariants>) => {
  return (
    <Button variant={variant} size={size} className={className} {...props}>
      <TaskIcon variant="foreground">{children}</TaskIcon>
    </Button>
  );
};
