import { StackHandler } from "@stackframe/stack";

export default function Handler(props: unknown) {
  return <StackHandler {...(props as object)} />;
}
