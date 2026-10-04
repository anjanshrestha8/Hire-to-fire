import { Drawer } from "@chakra-ui/react";
import type { ComponentProps, ReactNode } from "react";

export function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(details) => onOpenChange?.(details.open)}
    >
      {children}
    </Drawer.Root>
  );
}

export function SheetTrigger(props: ComponentProps<typeof Drawer.Trigger>) {
  return <Drawer.Trigger {...props} />;
}

export function SheetContent({
  children,
  side = "right",
  ...props
}: ComponentProps<typeof Drawer.Content> & {
  children?: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}) {
  void side;
  return (
    <>
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content {...props}>{children}</Drawer.Content>
      </Drawer.Positioner>
    </>
  );
}

export function SheetHeader(props: ComponentProps<typeof Drawer.Header>) {
  return <Drawer.Header {...props} />;
}

export function SheetFooter(props: ComponentProps<typeof Drawer.Footer>) {
  return <Drawer.Footer {...props} />;
}

export function SheetTitle(props: ComponentProps<typeof Drawer.Title>) {
  return <Drawer.Title {...props} />;
}

export function SheetDescription(
  props: ComponentProps<typeof Drawer.Description>
) {
  return <Drawer.Description {...props} />;
}

export function SheetClose(props: ComponentProps<typeof Drawer.CloseTrigger>) {
  return <Drawer.CloseTrigger {...props} />;
}
