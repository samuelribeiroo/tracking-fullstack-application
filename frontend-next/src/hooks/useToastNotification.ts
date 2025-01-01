import { useEffect } from "react";
import { RouteState } from "../app/actions/route-actions";
import { Zoom, toast } from "react-toastify";

export default function useToastNotifications(state: RouteState) {
  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success("Rota adicionada com sucesso!", {
        transition: Zoom,
        theme: "colored",
      });
    }
    if (state.error) {
      toast.error(`Erro: ${state.error}`, {
        transition: Zoom,
        theme: "colored",
      });
    }
  }, [state]);
}
