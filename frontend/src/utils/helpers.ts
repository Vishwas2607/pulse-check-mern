import type { StatusType, UIType } from "../features/monitors/types";
import { STATUS_BG_STYLES, STATUS_STYLES } from "./constants";

export const normalizeStatus = (isDown: undefined | boolean) => {
    if(isDown === undefined) return "UNKNOWN"
    else if(isDown) return "DOWN"
    else return "UP";
};

export const monitorBgStyle  = (status:StatusType) => {
    if (status === "DOWN") return STATUS_BG_STYLES.DOWN;
    else if (status === "UP") return STATUS_BG_STYLES.UP;
    else return STATUS_BG_STYLES.UNKNOWN;
};

export const monitorStatusStyle = (status:StatusType) => {
    if (status === "DOWN") return STATUS_STYLES.DOWN;
    else if (status === "UP") return STATUS_STYLES.UP;
    else return STATUS_STYLES.UNKNOWN;
};

export const getMonitorUiState = (status:StatusType, heartbeat:StatusType):UIType => {
  const ui: UIType = {
    state: "UNKNOWN",
    showPulse: false,
    showWarning: false,
  };

  if (!status) return ui;

  if (status === "DOWN") {
    return {
      state: "DOWN",
      showPulse: true,
      showWarning: false,
    };
  }

  if (status === "UP" && heartbeat === "DOWN") {
    return {
      state: "UP",
      showPulse: false,
      showWarning: true,
    };
  }

  if (status === "UP") {
    return {
      state: "UP",
      showPulse: false,
      showWarning: false,
    };
  }

  return ui;
};