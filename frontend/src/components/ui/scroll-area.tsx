import { ScrollArea as ChakraScrollArea } from "@chakra-ui/react";
import type { ComponentProps, ReactNode } from "react";

export function ScrollArea({
  children,
  ...props
}: ComponentProps<typeof ChakraScrollArea.Root> & { children?: ReactNode }) {
  return (
    <ChakraScrollArea.Root {...props}>
      <ChakraScrollArea.Viewport>
        <ChakraScrollArea.Content>{children}</ChakraScrollArea.Content>
      </ChakraScrollArea.Viewport>
      <ChakraScrollArea.Scrollbar>
        <ChakraScrollArea.Thumb />
      </ChakraScrollArea.Scrollbar>
    </ChakraScrollArea.Root>
  );
}
