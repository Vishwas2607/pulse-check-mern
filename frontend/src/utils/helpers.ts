import axios from "axios";
import type { StatusType, UIType } from "../features/monitors/types";
import { STATUS_BG_STYLES, STATUS_STYLES } from "./constants";
import dayjs from "dayjs";

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

export const formatXAxis = (tickItem: string,range:string) => {
  const date = dayjs(tickItem);
  switch (range) {
    case "24h": 
      return date.format("HH:mm"); // 14:00
    case "7d": 
      return date.format("ddd DD"); // Mon 21
    case "15d":
    case "30d": 
      return date.format("DD MMM"); // 21 Apr
    case "90d": 
      return date.format("MMM D"); // Apr 21
    default: 
      return date.format("DD/MM");
  }
};


export const checkErrorMsg = (err: unknown): string => {
    let errorMsg = "Something went wrong";

    if(axios.isAxiosError(err) && err.response) {
      if(err.response?.data) {
        const data = err.response.data;
        errorMsg = data.message || data.error || data.msg || errorMsg;
      } else if (err.request) {
        errorMsg = "No response from server. Check your connection.";
      } else {
        errorMsg = err.message
      }
    } else if(err instanceof Error) {
      errorMsg = err.message
    } else if (typeof err === "string") {
      errorMsg = err;
    }

    return errorMsg
}