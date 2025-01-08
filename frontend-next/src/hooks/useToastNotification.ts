import { useEffect } from "react";
import { RouteState } from "../app/actions/route-actions";
import { Zoom, toast } from "react-toastify";

interface UseToastNotificationsProps {
  state: RouteState;
  successMessage?: string; 
  errorMessage?: string;   
}

export default function useToastNotifications({
  state,
  successMessage = "Rota adicionada com sucesso!",
  errorMessage = "Erro ao processar a rota."
}: UseToastNotificationsProps) {
  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success(successMessage, {
        transition: Zoom,
        theme: "colored",
      });
    }
    if (state.error) {
      toast.error(errorMessage, {
        transition: Zoom,
        theme: "colored",
      });
    }
  }, [state, successMessage, errorMessage]);
}
