<script lang="ts">
    import Prompt from './Prompt.svelte';
    import History from './History.svelte';
    import Self from './WindowRenderer.svelte'
    import type {IWindow} from "$lib/types/types";
    import { isHistoryWindow, isPrompt, isMultiPromptWindow, isScannerWindow } from '$lib/helpers/helpers';
    import MultiPrompt from './MultiPrompt.svelte';
    import Scanner from './Scanner.svelte';

    let {windows}: {windows: IWindow[]} = $props();

    function onkeydown(e: KeyboardEvent, win: IWindow) {
        if (e.key === "Escape" && win.onclose != null) {
            win.onclose();  
        }
    }

    function onclick(e: MouseEvent, win: IWindow) {
        if (win.onclose != null && e.target === e.currentTarget) {
            win.onclose();
        }
    }
</script>

{#each windows as win, i (win.id)}
    <!-- Backdrop -->
    <div role="none" style="z-index: {i};" class="select-none absolute w-full h-full flex justify-center items-center"
    onkeydown={(e: KeyboardEvent) => onkeydown(e, win)}
    onclick={(e: MouseEvent) => onclick(e, win)}
    >
        {#if isPrompt(win)}
            <Prompt {...win}/>
        {:else if isHistoryWindow(win)}
            <History {...win}/>
        {:else if isMultiPromptWindow(win)}
            <MultiPrompt {...win}/>
        {:else if isScannerWindow(win)}
            <Scanner/>
        {/if}
    </div>
    <!-- Render children (if any) -->
    {#if win.children?.length}
        <Self windows={win.children}/>
    {/if}
{/each}