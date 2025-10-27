import type { ComponentProps, PropsWithChildren } from "react";

export const ScreenReader = ({
  children,
  ["aria-live"]: ariaLive = "polite",
  ...props
}: PropsWithChildren<
  Omit<ComponentProps<"div">, "className" | "aria-hidden">
>) => {
  return (
    <div {...props} className="sr-only" aria-live={ariaLive}>
      {children}
    </div>
  );
};
