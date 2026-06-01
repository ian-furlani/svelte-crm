import type { IWindow, IHistoryWindow, IPromptWindow, IMultiPromptWindow, IScannerWindow } from "$lib/types/types";

export function isPrompt(win: IWindow): win is IPromptWindow {
    return win.type === "prompt";
}

export function isHistoryWindow(win: IWindow): win is IHistoryWindow {
    return win.type === "history";
}

export function isMultiPromptWindow(win: IWindow): win is IMultiPromptWindow {
    return win.type === "multi-prompt";
}

export function isScannerWindow(win: IWindow): win is IScannerWindow {
    return win.type === "scanner";
}

export async function fetchJson(url: string) {
    const response = await fetch(url);
    const json = await response.json();
    return json;
}

export function assertNumber(a: unknown): a is number {
    return typeof a === "number";
}

export function isFiniteNumber(a: unknown) {
    return typeof a === 'number' && Number.isFinite(a) && !Number.isNaN(a);
}