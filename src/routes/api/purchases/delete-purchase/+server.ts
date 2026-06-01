import db from "$lib/db";
import { isFiniteNumber } from "$lib/helpers/helpers";
import { dbObserver } from "$lib/server/db-observer";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
    const jsonData = await request.json();
    const purchaseId = jsonData.purchaseId;

    if (!isFiniteNumber(purchaseId)) {
        return new Response("purchaseId is not a valid number", {status: 400});
    }
    
    const stmt = db.prepare("DELETE FROM purchases WHERE id = ?");
    stmt.run(purchaseId);
    
    dbObserver.notify(['purchases']);
    return new Response("Purchase removed successfully.");
}