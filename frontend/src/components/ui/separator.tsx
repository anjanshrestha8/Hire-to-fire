import { Box } from "@chakra-ui/react";
import type { ComponentProps } from "react";

export function Separator(props: ComponentProps<typeof Box>) {
  return (
    <Box
      as="hr"
      border="0"
      borderTopWidth="1px"
      borderColor="border"
      w="full"
      {...props}
    />
  );
}
