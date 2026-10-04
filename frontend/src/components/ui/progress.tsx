import { Progress as ChakraProgress } from "@chakra-ui/react";
import type { ComponentProps } from "react";

export function Progress({
  value,
  ...props
}: ComponentProps<typeof ChakraProgress.Root> & { value?: number | null }) {
  return (
    <ChakraProgress.Root value={value ?? null} {...props}>
      <ChakraProgress.Track>
        <ChakraProgress.Range />
      </ChakraProgress.Track>
    </ChakraProgress.Root>
  );
}
