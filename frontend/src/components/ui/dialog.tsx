import {
  Dialog as ChakraDialog,
  Portal,
  type DialogRootProps,
} from "@chakra-ui/react";
import type { ComponentProps, ReactNode } from "react";

interface DialogProps extends Omit<DialogRootProps, "onOpenChange" | "children"> {
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export function Dialog({ onOpenChange, children, ...props }: DialogProps) {
  return (
    <ChakraDialog.Root
      {...props}
      onOpenChange={(details) => onOpenChange?.(details.open)}
      placement="center"
      motionPreset="scale"
    >
      {children}
    </ChakraDialog.Root>
  );
}

export function DialogTrigger(
  props: ComponentProps<typeof ChakraDialog.Trigger>
) {
  return <ChakraDialog.Trigger {...props} />;
}

export function DialogOverlay(
  props: ComponentProps<typeof ChakraDialog.Backdrop>
) {
  return <ChakraDialog.Backdrop {...props} />;
}

export function DialogClose(
  props: ComponentProps<typeof ChakraDialog.CloseTrigger>
) {
  return <ChakraDialog.CloseTrigger {...props} />;
}

export function DialogContent({
  children,
  ...props
}: ComponentProps<typeof ChakraDialog.Content> & { children?: ReactNode }) {
  return (
    <Portal>
      <ChakraDialog.Backdrop />
      <ChakraDialog.Positioner>
        <ChakraDialog.Content {...props}>
          {children}
          <ChakraDialog.CloseTrigger />
        </ChakraDialog.Content>
      </ChakraDialog.Positioner>
    </Portal>
  );
}

export function DialogHeader(
  props: ComponentProps<typeof ChakraDialog.Header>
) {
  return <ChakraDialog.Header {...props} />;
}

export function DialogFooter(
  props: ComponentProps<typeof ChakraDialog.Footer>
) {
  return <ChakraDialog.Footer {...props} />;
}

export function DialogTitle(props: ComponentProps<typeof ChakraDialog.Title>) {
  return <ChakraDialog.Title {...props} />;
}

export function DialogDescription(
  props: ComponentProps<typeof ChakraDialog.Description>
) {
  return <ChakraDialog.Description {...props} />;
}
