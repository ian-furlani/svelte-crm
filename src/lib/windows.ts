import { isFiniteNumber } from "./helpers/helpers";
import type { IWindow, IHistoryWindow, IPromptWindow, WindowType, IMultiPromptWindow, PromptQuestion, IScannerWindow } from "./types/types";
import { WindowManager } from "./WindowManager.svelte";

abstract class Window implements IWindow {
    id: string;
    type: WindowType;
    visible: boolean;
    parent: IWindow | null;
    children: IWindow[];
    onclose: (() => void);
    destroy: (() => void);

    constructor(parent: IWindow | null) {
        this.type = "generic";
        this.id = crypto.randomUUID();
        this.visible = true;
        this.children = [];
        this.parent = parent;
        this.onclose = () => {console.warn("Window onclose handler"); this.destroy()}; // Default behaviour is to destroy the window.
        this.destroy = () => {throw new Error("Failed to close Window; this window is not attached to a WindowManager.")};
    }

    registerOnCloseHandlerAsync() {
        return new Promise(resolve => {
            this.onclose = () => {
                this.destroy();
                resolve(null);
            }
        });
    }

    registerOnCloseHandler(onclose: ()=>void) {
        this.onclose = onclose;
    }

    registerDestroyHandler(destroy: ()=>void) {
        this.destroy = destroy;
    }
}

export class HistoryWindow extends Window implements IHistoryWindow {
    type: "history";
    customerId: number;
    limitPerPage: number;

    constructor(customerId: number, limitPerPage: number, parent:IWindow|null=null) {
        if (limitPerPage <= 0) throw new Error("Limit per page must be greater than 0.");
        if (customerId < 0) throw new Error("Customer IDs are not negative.");
        if (!isFiniteNumber(customerId)) throw new Error("Invalid customer ID.");
        if (!isFiniteNumber(limitPerPage)) throw new Error("Invalid value for limitPerPage ID.");
    
        super(parent);
        this.type = "history";
        this.customerId = customerId;
        this.limitPerPage = limitPerPage;
    }
}

export class PromptWindow extends Window implements IPromptWindow {
    type: "prompt";
    heading: string;
    message: string;
    acceptsInput?: boolean | undefined;
    onconfirm: ((value: string | number | null) => void);
    autoClose?: boolean | undefined;
    
    constructor (heading: string, message: string, acceptsInput=false, parent:IWindow|null=null, autoClose=false) {        
        super(parent);

        this.type = "prompt";
        this.heading = heading;
        this.message = message;
        this.acceptsInput = acceptsInput;
        this.onconfirm = (value: string | number | null) => {this.onclose()};
        this.autoClose = autoClose;
    }

    registerOnCloseAndOnConfirmHandlersAsync() {
        return new Promise(resolve => {
            this.onconfirm = (value) => {
                this.destroy();
                resolve(value);
            };
            this.onclose = () => {
                this.destroy();
                resolve(null);
            };
        });
    }
}

export class MultiPromptWindow extends Window implements IMultiPromptWindow {
    type: "multi-prompt";
    heading: string;
    questions: PromptQuestion[];
    onconfirm: (value: Record<string, string>) => void;

    constructor(heading: string, questions: PromptQuestion[], parent: IWindow | null, onconfirm?: (value: object) => void) {
        super(parent);

        this.type = "multi-prompt";
        this.heading = heading;
        this.questions = questions;

        if (onconfirm) {
            this.onconfirm = onconfirm;
        }
        else {
            this.onconfirm = () => {};
        }
    }

    private getNullResponseObject() {
        const questionKeys = this.questions.map((q) => q.key);
        const objectWithNullFields: Record<string, null> = {};

        for (const key of questionKeys) {
            objectWithNullFields[key] = null;
        }

        return objectWithNullFields;
    }

    registerOnCloseAndOnConfirmHandlersAsync() {
        return new Promise(resolve => {
            this.onconfirm = (value) => {
                this.destroy();
                resolve(value);
            };
            this.onclose = () => {
                this.destroy();

                resolve(null);
            };
        });
    }
}

export class ScannerWindow extends Window implements IScannerWindow {
    type: "scanner";

    constructor(parent: IWindow | null) {
        super(parent);
        this.type = "scanner";
    }
}

export async function openAddPurchasePrompt(customerId: number) {
    // Persist asking user for value until they have entered a valid numerical value
        const prompt = new PromptWindow("Add New Purchase", "Add a new purchase for customer with ID " + customerId, true, null);
        WindowManager.getInstance().attachWindow(prompt);

        let input = null;

        while (true) {
            let error = false;
            try {
                input = await prompt.registerOnCloseAndOnConfirmHandlersAsync() as string;

                if (input == null) break;
                const inputAmount = Number.parseFloat(input.replaceAll(',', '.'));

                if (Number.isNaN(inputAmount)) throw new Error("Input is not a number.");

                // 1,23 EUR -> 123 money units (cents)
                const moneyUnits = Math.round(inputAmount * 100);

                //await addPurchaseHandler(customers, selectedCustomerId, inputAmount);
                const body = JSON.stringify({
                    value: moneyUnits,
                    customerId: customerId,
                    timestamp: Math.floor(Date.now()/1000), // number of seconds since epoch
                });

                await fetch("/api/purchases/add-purchase", {method: "POST", body});
            }
            catch (e: unknown) {
                error = true;
                let errorWin = new PromptWindow("Error", (e as Error).message, false, prompt, true);
                errorWin = WindowManager.getInstance().attachWindow(errorWin) as PromptWindow;
                await errorWin.registerOnCloseAndOnConfirmHandlersAsync();
            }

            if (!error) {
                break;
            }; // Break out when the user enters a numerical value
        }

    return input;
}

export function openScanner() {
    const scannerWindow = new ScannerWindow(null);
    WindowManager.getInstance().attachWindow(scannerWindow);
}