<script lang="ts">
  import type { IPromptWindow } from "$lib/types/types";
  import { onMount } from "svelte";

    let {heading, message, acceptsInput=true, onconfirm}: IPromptWindow = $props();

    let input: string | number | null = $state(null);

    // Allow user to press enter in the input field
    function inputKeyHandler(e: KeyboardEvent) {
        if (onconfirm == null) return;

        if (e.key === "Enter") {
            onconfirm(input);
        }
    }

    let inputElement: HTMLInputElement | null = $state(null);
    let okButton: HTMLButtonElement | null = $state(null);

    onMount(() => {
        if (acceptsInput) {
            // Focus on the input element
            if (inputElement == null) return;
            inputElement.focus();
        }
        else {
            if (okButton == null) return;
            okButton.focus();
        }
    });
</script>

<!-- Prompt Window -->
<div class="w-125 h-50 flex flex-col justify-start items-center p-4 bg-neutral-100 border border-neutral-400 rounded-xl">
    <!-- Prompt Heading -->
    <div class="text-center w-full text-3xl mb-2">{heading}</div>
    <!-- Prompt Contents -->
    <div class="flex-1 flex flex-col justify-around items-center">
        <div class="flex-1 flex flex-col justify-start items-center gap-2">
            <div class="text-center text-md w-full">{message}</div>
            {#if acceptsInput}
                <div class="w-full flex flex-row justify-center items-center">
                    <input autocomplete="off" bind:this={inputElement} onkeyup={inputKeyHandler} bind:value={input} type="text" lang="sl" step="1" min="0" name="prompt-answer" id="prompt-answer" class="bg-neutral-200 no-scrollbar p-1 rounded-lg">
                </div>
            {/if}
        </div>
        
        <button bind:this={okButton} class="focus: outline-neutral-400" onclick={()=>{onconfirm(input)}}>OK</button>
    </div>
</div>