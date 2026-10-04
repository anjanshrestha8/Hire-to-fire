import { Table as ChakraTable } from "@chakra-ui/react";
import type { ComponentProps } from "react";

export function Table(props: ComponentProps<typeof ChakraTable.Root>) {
  return <ChakraTable.Root {...props} />;
}

export function TableHeader(props: ComponentProps<typeof ChakraTable.Header>) {
  return <ChakraTable.Header {...props} />;
}

export function TableBody(props: ComponentProps<typeof ChakraTable.Body>) {
  return <ChakraTable.Body {...props} />;
}

export function TableFooter(props: ComponentProps<typeof ChakraTable.Footer>) {
  return <ChakraTable.Footer {...props} />;
}

export function TableRow(props: ComponentProps<typeof ChakraTable.Row>) {
  return <ChakraTable.Row {...props} />;
}

export function TableHead(
  props: ComponentProps<typeof ChakraTable.ColumnHeader>
) {
  return <ChakraTable.ColumnHeader {...props} />;
}

export function TableCell(props: ComponentProps<typeof ChakraTable.Cell>) {
  return <ChakraTable.Cell {...props} />;
}

export function TableCaption(props: ComponentProps<typeof ChakraTable.Caption>) {
  return <ChakraTable.Caption {...props} />;
}
