<script lang="ts">
  import type { IMultiPromptWindow } from "$lib/types/types";
  import { onMount } from "svelte";

    let {heading, questions, onconfirm}: IMultiPromptWindow = $props();

    const answers: Record<string, string | null> = {};

    // Allow user to press enter in the input field
    function inputKeyHandler(e: KeyboardEvent) {
        if (onconfirm == null) return;

        if (e.key === "Enter") {
            onconfirm(answers);
        }
    }

    let answerInputElements: Record<string, HTMLInputElement> = $state({});
    let okButton: HTMLButtonElement | null = $state(null);

    onMount(() => {
        if (Object.keys(answerInputElements).length > 0 && questions.length > 0) {
            // Focus on the first input element that is the answer to the first question
            answerInputElements[questions[0].key].focus();
        }

        const questionKeys = questions.map((q) => q.key);
        
        for (const questionKey of questionKeys) {
            answers[questionKey] = null;
        }
    });
</script>

<!-- Prompt Window -->
<div class="w-125 min-h-50 flex flex-col justify-start items-center p-4 bg-neutral-100 border border-neutral-400 rounded-xl">
    <!-- Prompt Heading -->
    <div class="text-center w-full text-3xl mb-2">{heading}</div>
    <!-- Prompt Contents -->
    <div class="flex-1 flex flex-col justify-around items-center">
        <div class="flex-1 flex flex-col justify-start items-center gap-2">
            {#each questions as question}
                <div class="text-center text-md w-full">{question.message}</div>
                <div class="w-full flex flex-row justify-center items-center">
                    <input autocomplete="off" bind:this={answerInputElements[question.key]} onkeyup={inputKeyHandler} bind:value={answers[question.key]} type="text" lang="sl" step="1" min="0" name="prompt-answer" id="prompt-answer" class="bg-neutral-200 no-scrollbar p-1 rounded-lg">
                </div>
            {/each} 
            <button bind:this={okButton} class="focus: outline-neutral-400" onclick={()=>{onconfirm(answers)}}>OK</button>
        </div>
    </div>
</div>