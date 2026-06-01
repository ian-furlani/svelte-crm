<script lang="ts">
    import { isFiniteNumber } from '$lib/helpers/helpers';
    import { openAddPurchasePrompt } from '$lib/windows';
    import Quagga from '@ericblade/quagga2';
    import { onMount } from 'svelte';

    let status = $state("Scan a barcode...");
    let popupOpened = false;

    onMount(async () => {
        const devices = await Quagga.CameraAccess.enumerateVideoDevices();

        devices.forEach(device => {
            console.log('Device:', device.label);
            console.log('Device ID:', device.deviceId);
            console.log('Group ID:', device.groupId);
        });

        Quagga.init({
            inputStream: {
                type: "LiveStream",
                target: document.querySelector('#scanner-container') ?? undefined,
            },
            decoder: {
                readers: ["code_128_reader"],
            }
        }, function(err) {
            if (err) {
                console.error("Failed to initialize:", err);
                status = "Error: " + err.message;
                return;
            }
            console.log("Scanner ready");
            Quagga.start();
        });

        Quagga.onDetected(async function(result) {
            if (popupOpened) return;

            new Audio("/sounds/scan-success.mp3").play();
            const code = result.codeResult.code;
            const format = result.codeResult.format;

            if (code == null) return;

            const customerId = Number.parseInt(code);

            if (isFiniteNumber(customerId)) {
                status = `Found ${format}: ${code}`;
                console.log("Barcode detected:", code);
                
                popupOpened = true;
                await openAddPurchasePrompt(customerId);
                popupOpened = false;
            }
            else {
                status = 'Invalid barcode!';
            }
        });
    });
</script>

<style>
    #scanner-container {
        position: relative;
        width: 100%;
        max-width: 640px;
    }
    #scanner-container :global(video) {
      width: 100%;
      border-radius: var(--radius-lg);
    }
    #scanner-container :global(canvas.drawingBuffer) {
        position: absolute;
        top: 0;
        left: 0;
    }
    #result {
      margin-top: 20px;
      padding: 10px;
    }
</style>

<div class="relative bg-theme-100 rounded-xl p-4 shadow-xl">
    <div id="scanner-container"></div>
    <div id="result">{status}</div>
</div>