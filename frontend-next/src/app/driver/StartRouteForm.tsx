import { PropsWithChildren, useActionState } from "react";
import { startRouteAction } from "./start-route-action";
import { StartRouteState } from "@/src/utils/models";
import useToastNotifications from "@/src/hooks/useToastNotification";

export default function StartRouteForm({ children }: PropsWithChildren) {
  const [state, formAction] = useActionState<StartRouteState, FormData>(
    startRouteAction,
    {}
  );

  useToastNotifications(state)

  return (
    <>
      <form className="flex flex-col gap-2" action={formAction}>
        {children}
      </form>
    </>
  );
}
