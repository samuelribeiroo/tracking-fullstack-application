import { PropsWithChildren } from "react";

export default function StartRouteForm({ children }: PropsWithChildren) {
  return (
    <>
    <form className="flex flex-col gap-2">
      {children}
    </form>
    </>
  )
}