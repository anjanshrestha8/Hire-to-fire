import {
  Avatar as ChakraAvatar,
  type AvatarRootProps,
} from "@chakra-ui/react";
import type { ReactNode } from "react";

export function Avatar({
  children,
  ...props
}: AvatarRootProps & { children?: ReactNode }) {
  return <ChakraAvatar.Root {...props}>{children}</ChakraAvatar.Root>;
}

export function AvatarImage(
  props: React.ComponentProps<typeof ChakraAvatar.Image>
) {
  return <ChakraAvatar.Image {...props} />;
}

export function AvatarFallback(
  props: React.ComponentProps<typeof ChakraAvatar.Fallback>
) {
  return <ChakraAvatar.Fallback {...props} />;
}
