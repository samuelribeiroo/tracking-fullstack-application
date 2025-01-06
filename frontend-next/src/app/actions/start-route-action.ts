"use server";

import { StartRouteState } from "../../utils/models/index";

export async function startRouteAction(state: StartRouteState, formData: FormData) {
  const routeId = formData.get("routeId") as string;

  if (!routeId) return { error: "ID da rota obrigatório." };

  const responseData = await fetch(
    `http://localhost:3000/routes/${routeId}/start`,
    { method: "POST" }
  );

  if (!responseData.ok) {
    console.error(responseData.text);
    return { error: "Erro ao iniciar a rota." };
  }

  return { success: true };
}
