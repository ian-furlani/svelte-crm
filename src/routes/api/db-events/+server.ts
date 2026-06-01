import type { RequestHandler } from "@sveltejs/kit";
import { dbObserver } from "$lib/server/db-observer";

export const GET: RequestHandler = ({url}) => {
    const tables = (url.searchParams.get("tables") ?? "").split(",").filter(s => s.length > 0);

    // Creates the readable stream for this session
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(': connected\n\n'); // Heartbeat message
            dbObserver.subscribe(tables, controller); // This controller is subscribed to the changes in these tables
        },
        cancel() {
            // Client disconnected
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        }
    })
};