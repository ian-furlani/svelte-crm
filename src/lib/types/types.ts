type ColumnType = string | number | boolean | null;

export interface Column<S extends Row> {
    label: string,
    getValue: (row: S) => ColumnType,
    dbName?: string,
    unit?: string,
}

export interface Row {
    [key: string]: ColumnType;
}

export interface CustomerStatsRow extends Row {
    id: number,
    name: string,
    lastName: string,
    email: string,
    totalPurchased: number,
}

export interface HistoryRow extends Row {
    id: number,
    timestamp: number,
    price: number,
}

export type WindowType = "prompt" | "history" | "multi-prompt" | "generic" | "scanner";

export interface IWindow {
    id: string,
    type: WindowType;
    visible: boolean,
    parent: IWindow | null,
    children: IWindow[],
    destroy: (() => void),
    onclose: (() => void),
    registerDestroyHandler: ((destroy: ()=>void) => void),
}

export interface IPromptWindow extends IWindow {
    type: "prompt",
    heading: string,
    message: string,
    acceptsInput?: boolean,
    autoClose?: boolean,
    onconfirm: ((value: string | number | null) => void),
}

export interface IMultiPromptWindow extends IWindow {
    type: "multi-prompt",
    heading: string,
    questions: PromptQuestion[],
    onconfirm: ((value: Record<string, string | null>) => void),
}

export interface IScannerWindow extends IWindow {
    type: "scanner",
}

export interface IHistoryWindow extends IWindow {
    type: "history",
    customerId: number,
    limitPerPage: number,
}

export type PromptQuestion = {
    key: string,
    message: string,
}

export type PromptCallback =  (input: string | null) => void;
export type CellType = string | number | boolean | null;

export type TableProps<S extends Row> = {
    title: string,
    columns: Column<S>[],
    onrowclick: (e: MouseEvent) => void,
    onrowrightclick: (e: MouseEvent) => void,
    getData: (page: number, limit: number, query?: string) => Promise<S[]>,
    watchTables: string[] | null,
    limit: number,
    searchable: boolean,
} 