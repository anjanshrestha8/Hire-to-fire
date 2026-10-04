import { Badge as ChakraBadge, type BadgeProps } from "@chakra-ui/react";
import type { ReactNode } from "react";

type ShadcnVariant = "default" | "secondary" | "destructive" | "outline";

interface Props extends Omit<BadgeProps, "variant"> {
  variant?: ShadcnVariant;
  children?: ReactNode;
}

const variantMap: Record<ShadcnVariant, BadgeProps["variant"]> = {
  default: "solid",
  secondary: "subtle",
  destructive: "solid",
  outline: "outline",
};

export function Badge({
  variant = "default",
  colorPalette,
  children,
  ...props
}: Props) {
  return (
    <ChakraBadge
      variant={variantMap[variant]}
      colorPalette={
        colorPalette ?? (variant === "destructive" ? "red" : "blue")
      }
      {...props}
    >
      {children}
    </ChakraBadge>
  );
}
