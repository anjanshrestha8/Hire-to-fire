import { Menu, Portal } from "@chakra-ui/react";
import { useId, type ComponentProps, type ReactNode } from "react";

export function DropdownMenu({ children }: { children?: ReactNode }) {
  return <Menu.Root>{children}</Menu.Root>;
}

export function DropdownMenuTrigger(
  props: ComponentProps<typeof Menu.Trigger>
) {
  return <Menu.Trigger {...props} />;
}

export function DropdownMenuContent({
  children,
  ...props
}: ComponentProps<typeof Menu.Content> & {
  align?: string;
  forceMount?: boolean;
  children?: ReactNode;
}) {
  // Strip shadcn-only props before forwarding to Chakra
  const {
    align: _a,
    forceMount: _f,
    ...rest
  } = props as ComponentProps<typeof Menu.Content> & {
    align?: string;
    forceMount?: boolean;
  };
  void _a;
  void _f;

  return (
    <Portal>
      <Menu.Positioner>
        <Menu.Content {...rest}>{children}</Menu.Content>
      </Menu.Positioner>
    </Portal>
  );
}

export function DropdownMenuItem({
  children,
  value,
  onClick,
  ...props
}: Omit<ComponentProps<typeof Menu.Item>, "value"> & {
  value?: string;
  onClick?: () => void;
  children?: ReactNode;
}) {
  const autoId = useId();
  return (
    <Menu.Item value={value ?? autoId} onClick={onClick} {...props}>
      {children}
    </Menu.Item>
  );
}

export function DropdownMenuLabel(
  props: ComponentProps<typeof Menu.ItemGroupLabel>
) {
  return <Menu.ItemGroupLabel {...props} />;
}

export function DropdownMenuSeparator(
  props: ComponentProps<typeof Menu.Separator>
) {
  return <Menu.Separator {...props} />;
}

export function DropdownMenuGroup(
  props: ComponentProps<typeof Menu.ItemGroup>
) {
  return <Menu.ItemGroup {...props} />;
}
