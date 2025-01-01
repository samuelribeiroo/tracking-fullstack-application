"use client";

import { PropsWithChildren, useActionState } from "react";
import { createRouteAction } from "../actions/route-actions";
import { RouteState } from "../actions/route-actions";
import useToastNotifications from "@/src/hooks/useToastNotification";


export default function NewRouteForm({ children }: PropsWithChildren) {
  const [state, formAction] = useActionState<RouteState, FormData>(
    createRouteAction,
    null
  );

  useToastNotifications(state)

  return (
    <form action={formAction}>
      {children}
    </form>
  );
}
