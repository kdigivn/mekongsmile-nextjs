import { Operator } from "@/services/apis/operators/types/operator";
import { OperatorCodeEnum } from "./enum";

export const html2ImagePrepareForCapture = (
  captureId: string,
  sectionCapture:
    | "voyages-schedules"
    | "voyages-schedules-mobile"
    | "boat-layout"
    | "mobile-boat-layout"
    | "default",
  operatorLayout?: Operator["operator_code"]
): {
  processElement: HTMLElement;
  hiddenContainer: HTMLElement;
} => {
  /**
   * CREATE HIDDEN CONTAINER OUTSIDE SCREEN
   */
  const hiddenContainer = document.createElement("div");
  hiddenContainer.style.position = "absolute";
  hiddenContainer.style.top = "-9999px";
  hiddenContainer.style.left = "-9999px";
  hiddenContainer.style.width = "auto";
  hiddenContainer.style.height = "auto";
  hiddenContainer.style.overflow = "visible";
  hiddenContainer.style.padding = "24px";
  hiddenContainer.style.borderRadius = "16px";
  document.body.appendChild(hiddenContainer);

  /**
   * HANDLE LOGIC
   */
  switch (sectionCapture) {
    case "boat-layout": {
      const el = document.getElementById(captureId);
      const cloned = el?.cloneNode(true) as HTMLElement;

      cloned.style.maxWidth = "unset";
      cloned.style.maxHeight = "unset";
      cloned.style.overflow = "visible";
      cloned.style.backgroundColor = "#fff";

      switch (operatorLayout) {
        case OperatorCodeEnum.SUPERDONG: {
          hiddenContainer.style.width = "1000px"; // a custom width for Superdong boat layouts, independent of device screen size
          break;
        }
        case OperatorCodeEnum.PHUQUOCEXPESS: {
          hiddenContainer.style.width = "1000px"; // a custom width for PhuQuocExpress boat layouts, independent of device screen size
          break;
        }
        default: {
          // console.log('BOAT LAYOUT DEFAULT');
        }
      }

      hiddenContainer.appendChild(cloned);
      return { processElement: cloned, hiddenContainer };
    }
    case "mobile-boat-layout": {
      const el = document.getElementById(captureId);
      const cloned = el?.cloneNode(true) as HTMLElement;

      cloned.style.backgroundColor = "#fff";

      switch (operatorLayout) {
        case OperatorCodeEnum.SUPERDONG: {
          hiddenContainer.style.width = "1000px"; // a custom width for Superdong boat layouts, independent of device screen size
          break;
        }
        case OperatorCodeEnum.PHUQUOCEXPESS: {
          hiddenContainer.style.width = "1000px"; // a custom width for PhuQuocExpress boat layouts, independent of device screen size
          break;
        }
        default: {
          // console.log('BOAT LAYOUT DEFAULT');
        }
      }

      hiddenContainer.appendChild(cloned);
      return { processElement: cloned, hiddenContainer };
    }
    case "voyages-schedules": {
      const el = document.getElementById(captureId);
      const cloned = el?.cloneNode(true) as HTMLElement;

      cloned.style.width = "1200px"; // this width is independent of device screen size
      cloned.style.overflow = "visible";
      cloned.style.backgroundColor = "rgb(244, 246, 248)";

      hiddenContainer.appendChild(cloned);
      return { processElement: cloned, hiddenContainer };
    }
    case "voyages-schedules-mobile": {
      const el = document.getElementById(captureId);
      const cloned = el?.cloneNode(true) as HTMLElement;

      cloned.style.width = "500px"; // this width is independent of device screen size
      cloned.style.overflow = "visible";
      cloned.style.backgroundColor = "rgb(244, 246, 248)";

      hiddenContainer.appendChild(cloned);
      return { processElement: cloned, hiddenContainer };
    }

    case "default": {
      const el = document.getElementById(captureId);
      const cloned = el?.cloneNode(true) as HTMLElement;

      if (!cloned) {
        const defaultNode = document.createElement("div");
        hiddenContainer.appendChild(defaultNode);
        return { processElement: defaultNode, hiddenContainer };
      }

      cloned.style.backgroundColor = "#fff";
      cloned.style.overflow = "visible";
      cloned.style.padding = "16px";
      cloned.style.borderRadius = "8px";

      hiddenContainer.appendChild(cloned);
      return { processElement: cloned, hiddenContainer };
    }
  }
};

export const html2ImageRestoreAfterCapture = (
  hiddenContainer: HTMLElement
): void => {
  // Remove the hidden container and its contents
  if (hiddenContainer && hiddenContainer.parentElement) {
    hiddenContainer.parentElement.removeChild(hiddenContainer);
  }
};
