import type {IHistoryWindow, IPromptWindow, IWindow} from "$lib/types/types";
import { isFiniteNumber } from "./helpers/helpers";

export class WindowManager {
    windows = $state<IWindow[]>([]);
    hasWindows = $derived<boolean>(this.windows.length > 0);
    backgroundBlur = $derived<boolean>(this.hasWindows);
    
    static instance: WindowManager;

    private constructor(){}

    static getInstance(): WindowManager {
        if (!WindowManager.instance) {
            WindowManager.instance = new WindowManager();
        }

        return WindowManager.instance;
    }

    destroyWindow(win: IWindow) {
        this.detachWindow(win);
    }

    detachWindow(window: IWindow) {
        if (window.parent) {
            this.detachWindowFromParent(window.parent, window);
        }
        else {
            this.detachWindowFromGlobal(window);
        }
    }

    private detachWindowFromParent(parent: IWindow, child: IWindow) {
        const parentChildren = parent.children;
        
        const index = this.windows.findIndex(w => w.id === child.id);
        if (index !== -1) {
            parentChildren.splice(index, 1);
        }
        else { 
            throw new Error("Error destroying window, window not found as parent's child.");
        }
    }

    private detachWindowFromGlobal(window: IWindow) {
        const index = this.windows.findIndex(w => w.id === window.id);
        if (index !== -1) {
            this.windows.splice(index, 1);
        }
        else {
            throw new Error("Error destroying window, window not found.")
        }
    }

    attachWindow(window: IWindow): IWindow {
        window.registerDestroyHandler(() => this.destroyWindow(window));

        if (window.parent) {
            return this.attachWindowToParent(window.parent, window);
        }
        else {
            return this.attachWindowToGlobal(window);
        }
    }

    private attachWindowToParent(parent: IWindow, child: IWindow): IWindow {
        parent.children = [...parent.children, child];
        return parent.children[parent.children.length-1] as IPromptWindow;
    }

    private attachWindowToGlobal(window: IWindow): IWindow {
        this.windows.push(window);
        return this.windows[this.windows.length-1] as IPromptWindow;
    }
}