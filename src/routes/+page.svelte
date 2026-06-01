<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import WindowRenderer from "$lib/components/WindowRenderer.svelte";
    import { fetchJson } from "$lib/helpers/helpers";
    import {type Row, type Column, type CustomerStatsRow} from "$lib/types/types";
    import { WindowManager } from "$lib/WindowManager.svelte";
    import { HistoryWindow, MultiPromptWindow, openAddPurchasePrompt, openScanner, PromptWindow } from "$lib/windows";

    let columns = $state<Column<CustomerStatsRow>[]>([
        {
            label: "ID",
            getValue: (row: Row) => row.id,
        },
        {
            label: "Name",
            getValue: (row) => row.name,
        },
        {
            label: "Last Name",
            getValue: (row) => row.lastName,
        },
        {
            label: "E-Mail",
            getValue: (row) => row.email,
        },
        {
            label: "Total",
            getValue: (row) => row.totalPurchased / 100,
            unit: "€",
        },
        {
            label: "Discount",
            getValue: (row) => getDiscount(row.totalPurchased),
            unit: "%",
        },
    ]);

    function getDiscount(moneyUnits: number) {
        const total = moneyUnits / 100;
        if (total < 50) return 0;
        if (total >= 50 && total < 100) return 5;
        if (total >= 100 && total < 200) return 7;
        return 10;
    }

    let selectedCustomerId = -1;

    async function customerTableRowClickHandler(e: MouseEvent) {
        const target = e.target as HTMLDivElement;

        const customerIdAttr = target.getAttribute("data-id");
        if (customerIdAttr == null) return;

        const parsedCustomerId = Number.parseInt(customerIdAttr, 10);

        if (Number.isNaN(parsedCustomerId)) return;

        selectedCustomerId = parsedCustomerId;

        openAddPurchasePrompt(selectedCustomerId);
    }

    async function customerTableRowRightClickHandler(e: MouseEvent) {
        e.preventDefault();
        const target = e.target as HTMLDivElement;
        let customerId = target.getAttribute("data-id");
        if (customerId == null) return;

        const parsedCustomerId = Number.parseInt(customerId, 10);

        const historyWindow = new HistoryWindow(parsedCustomerId, 10, null);
        windowManager.attachWindow(historyWindow);

        await historyWindow.registerOnCloseHandlerAsync();
    }

    async function openNewCustomerPrompt() {
        const newCustomerPrompt = new MultiPromptWindow("Add new customer", [
            {key: "firstName", message: "First Name"},
            {key: "lastName", message: "Last Name"},
            {key: "email", message: "E-Mail"},
        ], null);

        let error: boolean;

        do {
            error = false;
            windowManager.attachWindow(newCustomerPrompt);

            const response = await newCustomerPrompt.registerOnCloseAndOnConfirmHandlersAsync() as {
                firstName: string,
                lastName: string,
                email: string,
            };
            
            if (response == null) break;
            if (Object.values(response).some(v => v == null)) {
                error = true;
            }
            
            if (error) {    
                const errorWindow = new PromptWindow("Error", "Error adding customer: a field cannot be empty.", false, null, true);
                windowManager.attachWindow(errorWindow);
                await errorWindow.registerOnCloseAndOnConfirmHandlersAsync();
            }
            else {
                fetch("/api/customers/add-customer", {method: "POST", body: JSON.stringify(response)});
            }
        }
        while (error);
    }

    const windowManager = WindowManager.getInstance();
</script>

<div class="w-screen h-screen gap-2 flex flex-col justify-center items-center bg-theme-100">
  <div class="h-[80%] w-[80%] bg-theme-200 rounded-xl flex flex-col justify-start {windowManager.backgroundBlur ? "blur-xs" : "blur-none"}">
    <Table title="Customers" watchTables={["customers", "purchases"]} {columns} getData={async (page, limit, query) => await fetchJson(`/api/customers/list?${new URLSearchParams({page, limit, query}).toString()}`)} limit={20} onrowclick={customerTableRowClickHandler} onrowrightclick={customerTableRowRightClickHandler}/>
  </div>
  <button onclick={openNewCustomerPrompt}>Add new customer</button>
  <button onclick={openScanner}>Scan Code</button>
  <div class="text-base text-left">
    <span><span class="font-bold">Add new purchase</span>: left-click on any customer cell<br></span>
    <span><span class="font-bold">View customer history and data</span>: right click on any customer cell<br></span>
  </div>
  <!-- Recursively render windows, starting from the top-level (parentless) `windows` array. -->
  <WindowRenderer windows={windowManager.windows}/>
</div>