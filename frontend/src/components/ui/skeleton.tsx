import { Skeleton as ChakraSkeleton, type SkeletonProps } from "@chakra-ui/react";

export function Skeleton(props: SkeletonProps) {
  return <ChakraSkeleton {...props} />;
}
