import { ComponentPropsWithoutRef, ElementType } from "react";

export type PolymorphicComponentProps<
  E extends ElementType,
  Props = Record<string, never>,
> = {
  as?: E;
} & Props &
  Omit<ComponentPropsWithoutRef<E>, keyof Props>;
