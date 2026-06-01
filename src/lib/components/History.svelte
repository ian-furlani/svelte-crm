<script lang="ts">
  import type { Column, HistoryRow, IHistoryWindow } from "$lib/types/types";
  import Table from "./Table.svelte";
  import {fetchJson} from "$lib/helpers/helpers";

    let {customerId, limitPerPage}: IHistoryWindow = $props();

    let page = $state(0);

    const columns: Column<HistoryRow>[] = [
        {
            label: "ID",
            getValue: (row) => row.id,
        },
        {
            label: "Timestamp",
            getValue: (row) => new Date(row.timestamp * 1000).toLocaleString(),
        },
        {
            label: "Price",
            getValue: (row) => row.price / 100,
            unit: "€",
        }
    ];

    async function onentryremove(e: MouseEvent) {
        e.preventDefault(); // prevent context menu
        const target = e.target as HTMLDivElement;
        if (target == null) return;

        const purchaseId = target.getAttribute("data-id");
        if (purchaseId == null) return;
        const parsedPurchaseId = Number.parseInt(purchaseId);

        await fetch("api/purchases/delete-purchase", {method: "POST", body: JSON.stringify({purchaseId: parsedPurchaseId})});
    }

    async function getHistory(page: number, limit: number) {
        return await fetchJson(`api/purchases/list?customerId=${customerId}&limit=${limit}&page=${page}`);
    }

</script>

<div class="w-125 h-100 flex flex-col justify-start items-center p-2 bg-neutral-200 border border-neutral-400 rounded-xl">
    <!-- <div class="text-center w-full text-3xl mb-2">Purchase History</div> -->
    <div class="flex-1 flex flex-col justify-around items-center w-full h-full">
        <!-- Here we fetch from DB -->
        <Table title="Purchase History" watchTables={["purchases"]} {columns} getData={async (page, limit) => await getHistory(page, limit)} limit={limitPerPage} onrowclick={() => {}} onrowrightclick={onentryremove} searchable={false}></Table>
    </div>
</div>