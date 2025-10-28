import { forwardRef, type ComponentProps, type PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";

export const TaskInputGroup = ({
  className,
  children,
  ...props
}: ComponentProps<"div">)  => {
  return (
    <InputGroup
      className={cn("border-none shadow-none h-19", className)}
      {...props}
    >
      {children}
    </InputGroup>
  );
};

export const TaskInputGroupInput = forwardRef<
  HTMLInputElement,
  ComponentProps<"input"> 
>(({ className,  ...props }, ref) => {
  return (
    <InputGroupInput
      ref={ref}
      className={cn("font-medium -mt-0.5 border-none shadow-none", className)}
      {...props}
    />
  );
});

export const TaskInputGroupIconAddon = ({
  className,
  children,
  ...props
}: PropsWithChildren<ComponentProps<'div'>>) => {
  return (
    <InputGroupAddon aria-hidden {...props}>
      <div className={cn("w-13 mr-1 flex justify-center", className)}>
        {children}
      </div>
    </InputGroupAddon>
  );
};

export const TaskInputGroupButtonAddon = ({
  className,
  children,
  ...props
}: PropsWithChildren<ComponentProps<"div">>) => {
  return (
    <InputGroupAddon align="inline-end" className={cn("pr-6", className)} {...props}>
      {children}
    </InputGroupAddon>
  );
};
