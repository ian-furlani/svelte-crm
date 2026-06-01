<script lang="ts" generics="S extends Row">
    import type {Row, TableProps} from "$lib/types/types";
    import { onDestroy, onMount } from "svelte";
    import Dummy from "./Dummy.svelte";

    let {title, columns, onrowclick=()=>{}, onrowrightclick=()=>{}, watchTables=[], getData=async()=>[], limit, searchable=true}: TableProps<S> = $props();

    let page = $state(0);
    let rows = $state<S[]>([]);
    let query = $state("");

    let loading = $state(false);

    let eventSources: EventSource[] = [];

    async function refresh() {
        loading = true;
        rows = await getData(page, limit, query);
        loading = false;
    }

    $effect(() => {
        refresh();
    });

    // Reacts to query change
    $effect(() => {
        if (query.length > 0) {
            page = 0;
            refresh();
        }
    });

    // Configure the Event Source to react to database changes
    onMount(async () => {
        await refresh();

        if (!watchTables) return;

        // Register handlers for each watched table
        for (const watchTable of watchTables) {
            const eventSource = new EventSource(`/api/db-events?tables=${watchTable}`);
            eventSource.onmessage = () => refresh();
            eventSource.onerror = () => eventSource?.close();

            eventSources.push(eventSource);
        }
    });

    onDestroy(() => {
        for (const eventSource of eventSources) {
            eventSource.close();
        }
    });
</script>

<div class="bg-theme-200 rounded-xl flex flex-col h-full w-full p-4 scroll-smooth">
    <!-- Title  -->
    <div class="text-3xl text-center py-2 border-b border-b-neutral-400 rounded-t-xl">{title}</div>

    <!-- Rows should take all remaining space in the container -->
    <div style="display:grid; grid-template-columns: repeat({columns.length}, auto);" class="flex-1 overflow-y-auto overflow-x-hidden">
        <!-- Skeleton (loading) -->
        {#each columns as col (col.label)}
            <div class="col">
                <div class="col-heading">
                    {#if loading}
                        <Dummy length={col.label.length*2}/>
                    {:else}
                        {col.label}
                    {/if}
                </div>
                {#if loading}
                    {#each {length: limit}}
                        <div class="col-entry"><Dummy length={20}/></div>
                    {/each}
                {:else}    
                    {#each rows as row (row.id)}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div class="col-entry" data-id={row.id} onclick={onrowclick} oncontextmenu={onrowrightclick}>{col.getValue(row)} {col.unit ?? ""}</div>
                    {/each}
                {/if}
            </div>
        {/each}
    </div>

    <!-- Below the table: navigation buttons and search bar -->
    <div class="mt-2 flex flex-row justify-between items-center">
        <div class="whitespace-nowrap">
            <button onclick={() => page = Math.max(0, page-1)}>Previous Page</button>
            <button onclick={() => page++}>Next Page</button>
        </div>
        {#if searchable}
        <div class="whitespace-nowrap">
            <span>Search:</span>
            <input type="text" bind:value={query}>
        </div>
        {/if}
    </div>
</div>

