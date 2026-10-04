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
import { Menu } from "lucide-react";

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
      color="#16325c"
      _hover={{ bg: "#eef3f9" }}
      borderRadius="8px"
      {...props}
    >
      <Menu size={20} strokeWidth={1.75} />
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
      w={state === "collapsed" ? "5rem" : "16rem"}
      minH="100vh"
      h="100vh"
      flexShrink={0}
      transition="width 0.2s ease"
      display="flex"
      flexDirection="column"
      overflow="hidden"
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
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Text
      className={className}
      style={style}
      fontSize="xs"
      fontWeight="semibold"
      py="2"
    >
      {children}
    </Text>
  );
}

export function SidebarGroupContent({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Box className={className} style={style}>
      {children}
    </Box>
  );
}

export function SidebarMenu({ children }: { children?: ReactNode }) {
  return (
    <Stack as="ul" gap="2" listStyleType="none" m="0" p="0">
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
