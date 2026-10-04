import { Card as ChakraCard } from "@chakra-ui/react";
import type { ComponentProps } from "react";

export function Card(props: ComponentProps<typeof ChakraCard.Root>) {
  return <ChakraCard.Root {...props} />;
}

export function CardHeader(props: ComponentProps<typeof ChakraCard.Header>) {
  return <ChakraCard.Header {...props} />;
}

export function CardTitle(props: ComponentProps<typeof ChakraCard.Title>) {
  return <ChakraCard.Title {...props} />;
}

export function CardDescription(
  props: ComponentProps<typeof ChakraCard.Description>
) {
  return <ChakraCard.Description {...props} />;
}

export function CardContent(props: ComponentProps<typeof ChakraCard.Body>) {
  return <ChakraCard.Body {...props} />;
}

export function CardFooter(props: ComponentProps<typeof ChakraCard.Footer>) {
  return <ChakraCard.Footer {...props} />;
}
