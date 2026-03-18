import React, { useCallback, useEffect, useMemo } from "react";
import { isMac } from "@/lib/utils";
import { KeyMod } from "@/lib/key-codes";

export type KeyboardOptions = {
  disableGlobalEvent?: boolean;
  stopPropagation?: boolean;
  preventDefault?: boolean;
  capture?: boolean;
  event?: "keydown" | "keypress" | "keyup";
};

export type KeyboardResult = {
  bindings: {
    onKeyDown: React.KeyboardEventHandler;
    onKeyDownCapture: React.KeyboardEventHandler;
    onKeyPress: React.KeyboardEventHandler;
    onKeyPressCapture: React.KeyboardEventHandler;
    onKeyUp: React.KeyboardEventHandler;
    onKeyUpCapture: React.KeyboardEventHandler;
  };
};

export type UseKeyboardHandler = (
  event: React.KeyboardEvent | KeyboardEvent
) => void;

export type UseKeyboard = (
  handler: UseKeyboardHandler,
  keyBindings: Array<number> | number,
  options?: KeyboardOptions
) => KeyboardResult;

/**
 * This hook will listen for a specific key binding and trigger its handler.
 * 
 * The code is based on Geist [useKeyboard](https://geist-ui.dev/en-us/hooks/use-keyboard) hook
 * @param handler Handler for key binding
 * @param keyBindings
 * @param options
 * @returns
 * 
 * @example Listen for global keyboard event
 * ```tsx
 * useKeyboard(
    () => alert('save success!'),
    [KeyCode.KEY_S, KeyMod.CtrlCmd]
  )
    ```
 *  @example Keyboard events listening on elements.
    ```tsx
    const { bindings } = useKeyboard(
    () => alert('A is not allowed'),
    [KeyCode.KEY_A],
    { disableGlobalEvent: true },
  )
  return (
  <div>
    <p>Keyboard events are triggered only when the element is activated.</p>
    <input {...bindings} placeholder="Press A" />
  </div>
  )
  ```
 */
export const useKeyboard: UseKeyboard = (
  handler,
  keyBindings,
  options = {}
) => {
  const bindings = Array.isArray(keyBindings)
    ? (keyBindings as number[])
    : [keyBindings];
  const {
    disableGlobalEvent = false,
    capture = false,
    stopPropagation = false,
    preventDefault = true,
    event = "keydown",
  } = options;
  const activeModMap = getActiveModMap(bindings);
  const keyCode = bindings.filter((item: number) => !KeyMod[item]);
  const { CtrlCmd, WinCtrl } = getCtrlKeysByPlatform();

  const eventHandler = useCallback(
    (event: React.KeyboardEvent | KeyboardEvent) => {
      if (activeModMap.Shift && !event.shiftKey) return;
      if (activeModMap.Alt && !event.altKey) return;
      if (activeModMap.CtrlCmd && !event[CtrlCmd]) return;
      if (activeModMap.WinCtrl && !event[WinCtrl]) return;
      const hitOne = keyCode.find((k) => k === event.keyCode);
      if (keyCode && !hitOne) return;
      if (stopPropagation) {
        event.stopPropagation();
      }
      if (preventDefault) {
        event.preventDefault();
      }
      if (handler) handler(event);
    },
    [
      CtrlCmd,
      WinCtrl,
      activeModMap.Alt,
      activeModMap.CtrlCmd,
      activeModMap.Shift,
      activeModMap.WinCtrl,
      handler,
      keyCode,
      preventDefault,
      stopPropagation,
    ]
  );

  useEffect(() => {
    if (!disableGlobalEvent) {
      document.addEventListener(event, eventHandler);
    }
    return () => {
      document.removeEventListener(event, eventHandler);
    };
  }, [disableGlobalEvent, event, eventHandler]);

  const elementBindingHandler = useCallback(
    (
      elementEventType: "keydown" | "keypress" | "keyup",
      isCapture: boolean = false
    ) => {
      if (elementEventType !== event) return () => {};
      if (isCapture !== capture) return () => {};
      return (e: React.KeyboardEvent) => eventHandler(e);
    },
    [capture, event, eventHandler]
  );

  const result = useMemo(
    () => ({
      bindings: {
        onKeyDown: elementBindingHandler("keydown"),
        onKeyDownCapture: elementBindingHandler("keydown", true),
        onKeyPress: elementBindingHandler("keypress"),
        onKeyPressCapture: elementBindingHandler("keypress", true),
        onKeyUp: elementBindingHandler("keyup"),
        onKeyUpCapture: elementBindingHandler("keyup", true),
      },
    }),
    [elementBindingHandler]
  );

  return result;
};

const getCtrlKeysByPlatform = (): Record<string, "metaKey" | "ctrlKey"> => {
  return {
    CtrlCmd: isMac() ? "metaKey" : "ctrlKey",
    WinCtrl: isMac() ? "ctrlKey" : "metaKey",
  };
};

const getActiveModMap = (
  bindings: number[]
): Record<keyof typeof KeyMod, boolean> => {
  const modBindings = bindings.filter((item: number) => !!KeyMod[item]);
  const activeModMap: Record<keyof typeof KeyMod, boolean> = {
    CtrlCmd: false,
    Shift: false,
    Alt: false,
    WinCtrl: false,
  };
  modBindings.forEach((code) => {
    const modKey = KeyMod[code] as keyof typeof KeyMod;
    activeModMap[modKey] = true;
  });
  return activeModMap;
};
