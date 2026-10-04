import {
  Button as ChakraButton,
  IconButton,
  type ButtonProps as ChakraButtonProps,
} from "@chakra-ui/react";
import type { ReactNode } from "react";

type ShadcnVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
type ShadcnSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps
  extends Omit<ChakraButtonProps, "variant" | "size"> {
  variant?: ShadcnVariant;
  size?: ShadcnSize;
  asChild?: boolean;
  children?: ReactNode;
}

const variantMap: Record<
  ShadcnVariant,
  ChakraButtonProps["variant"]
> = {
  default: "solid",
  destructive: "solid",
  outline: "outline",
  secondary: "subtle",
  ghost: "ghost",
  link: "plain",
};

const sizeMap: Record<ShadcnSize, ChakraButtonProps["size"]> = {
  default: "md",
  sm: "sm",
  lg: "lg",
  icon: "sm",
};

export function Button({
  variant = "default",
  size = "default",
  colorPalette,
  children,
  ...props
}: ButtonProps) {
  const mappedVariant = variantMap[variant];
  const mappedSize = sizeMap[size];
  const palette =
    colorPalette ?? (variant === "destructive" ? "red" : "blue");

  if (size === "icon") {
    return (
      <IconButton
        variant={mappedVariant}
        size={mappedSize}
        colorPalette={palette}
        aria-label={typeof props["aria-label"] === "string" ? props["aria-label"] : "button"}
        {...props}
      >
        {children}
      </IconButton>
    );
  }

  return (
    <ChakraButton
      variant={mappedVariant}
      size={mappedSize}
      colorPalette={palette}
      {...props}
    >
      {children}
    </ChakraButton>
  );
}
