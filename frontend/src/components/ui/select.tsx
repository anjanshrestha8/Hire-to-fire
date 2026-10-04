import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { NativeSelect } from "@chakra-ui/react";

interface SelectProps {
  children?: ReactNode;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children?: ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
}

function collectItems(node: ReactNode): SelectItemProps[] {
  const items: SelectItemProps[] = [];

  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return;
    const element = child as ReactElement<{
      children?: ReactNode;
      value?: string;
    }>;
    if (element.type === SelectItem && element.props.value != null) {
      items.push({
        value: element.props.value,
        children: element.props.children,
      });
      return;
    }
    items.push(...collectItems(element.props.children));
  });

  return items;
}

function collectPlaceholder(node: ReactNode): string | undefined {
  let placeholder: string | undefined;

  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return;
    const element = child as ReactElement<{
      children?: ReactNode;
      placeholder?: string;
    }>;
    if (element.type === SelectValue) {
      placeholder = element.props.placeholder;
      return;
    }
    placeholder = placeholder ?? collectPlaceholder(element.props.children);
  });

  return placeholder;
}

export function Select({
  children,
  onValueChange,
  defaultValue,
  value,
  disabled,
  className,
}: SelectProps) {
  const items = collectItems(children);
  const placeholder = collectPlaceholder(children);

  return (
    <NativeSelect.Root disabled={disabled} className={className} width="full">
      <NativeSelect.Field
        defaultValue={defaultValue}
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.children}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}

export function SelectTrigger({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <span className={className}>{children}</span>;
}

export function SelectValue(_props: SelectValueProps) {
  void _props;
  return null;
}

export function SelectContent({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  void className;
  return <>{children}</>;
}

export function SelectItem(_props: SelectItemProps) {
  void _props;
  return null;
}
