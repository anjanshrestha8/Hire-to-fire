import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Box, Flex, IconButton, Stack, Text } from "@chakra-ui/react";
import { PanelLeft } from "lucide-react";

type SidebarState = "expanded" | "collapsed";

interface SidebarContextValue {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return ctx;
}

export function SidebarProvider({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(true);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const value = useMemo<SidebarContextValue>(
    () => ({
      open,
      setOpen,
      toggle,
      state: open ? "expanded" : "collapsed",
    }),
    [open, toggle]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function SidebarTrigger(props: ComponentProps<typeof IconButton>) {
  const { toggle } = useSidebar();
  return (
    <IconButton
      aria-label="Toggle Sidebar"
      variant="ghost"
      size="sm"
      onClick={toggle}
      color="white"
      _hover={{ bg: "whiteAlpha.200" }}
      {...props}
    >
      <PanelLeft size={18} />
    </IconButton>
  );
}

export function Sidebar({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  collapsible?: string;
}) {
  const { state } = useSidebar();
  return (
    <Box
      as="aside"
      className={className}
      style={style}
      w={state === "collapsed" ? "20" : "64"}
      minH="100vh"
      transition="width 0.2s ease"
      display="flex"
      flexDirection="column"
    >
      {children}
    </Box>
  );
}

export function SidebarContent({ children }: { children?: ReactNode }) {
  return (
    <Flex direction="column" flex="1" overflowY="auto">
      {children}
    </Flex>
  );
}

export function SidebarGroup({ children }: { children?: ReactNode }) {
  return <Box py="2">{children}</Box>;
}

export function SidebarGroupLabel({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Text
      className={className}
      fontSize="xs"
      fontWeight="semibold"
      px="4"
      py="2"
    >
      {children}
    </Text>
  );
}

export function SidebarGroupContent({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <Box className={className}>{children}</Box>;
}

export function SidebarMenu({ children }: { children?: ReactNode }) {
  return (
    <Stack as="ul" gap="1" listStyleType="none" m="0" p="0">
      {children}
    </Stack>
  );
}

export function SidebarMenuItem({ children }: { children?: ReactNode }) {
  return <Box as="li">{children}</Box>;
}

export function SidebarMenuButton({ children }: { children?: ReactNode }) {
  return (
    <Box as="button" w="full" textAlign="left">
      {children}
    </Box>
  );
}
