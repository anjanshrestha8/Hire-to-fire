import { Tooltip as ChakraTooltip, Portal } from "@chakra-ui/react";
import type { ComponentProps, ReactNode } from "react";

export function TooltipProvider({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children?: ReactNode }) {
  return <ChakraTooltip.Root>{children}</ChakraTooltip.Root>;
}

export function TooltipTrigger(
  props: ComponentProps<typeof ChakraTooltip.Trigger>
) {
  return <ChakraTooltip.Trigger {...props} />;
}

export function TooltipContent({
  children,
  ...props
}: ComponentProps<typeof ChakraTooltip.Content> & { children?: ReactNode }) {
  return (
    <Portal>
      <ChakraTooltip.Positioner>
        <ChakraTooltip.Content {...props}>{children}</ChakraTooltip.Content>
      </ChakraTooltip.Positioner>
    </Portal>
  );
}
