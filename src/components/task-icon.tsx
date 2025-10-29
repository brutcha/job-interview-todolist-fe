import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const taskIconVariants = cva("size-6", {
  variants: {
    variant: {
      default: "",
      primary: "text-primary",
      foreground: "text-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const TaskIcon = ({
  className,
  variant,
  ...props
}: ComponentProps<typeof Slot> &
  VariantProps<typeof taskIconVariants>) => {
  return (
    <Slot
      aria-hidden
      className={cn(taskIconVariants({ variant }), className)}
      {...props}
    />
  );
};
