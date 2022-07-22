import { useEffect } from "react";
import Router from "next/router";
import { useBeforeUnload } from "react-use";

export const useLeavePageConfirm = (
  isConfirm = true,
  message = "Você tem certeza que deseja sair dessa página? \nModificações não salvas serão perdidas"
) => {
  useBeforeUnload(isConfirm, message);

  useEffect(() => {
    const handler = () => {
      if (isConfirm && !window.confirm(message)) {
        throw "Route Canceled";
      }
    };

    Router.events.on("beforeHistoryChange", handler);

    return () => {
      Router.events.off("beforeHistoryChange", handler);
    };
  }, [isConfirm, message]);
};
