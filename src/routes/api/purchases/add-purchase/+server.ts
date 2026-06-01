import db from "$lib/db";
import { isFiniteNumber } from "$lib/helpers/helpers";
import { dbObserver } from "$lib/server/db-observer";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();

    if (data.value == null) {
        return new Response("Purchase needs to have a value.", {status: 400});
    }

    if (data.customerId == null) {
        return new Response("Purchase needs to have a customerId", {status: 400});
    }

    if (data.timestamp == null) {
        return new Response("Purchase needs to have a timestamp", {status: 400});
    }

    // Validate for valid number
    for (const [key, value] of Object.entries(data)) {
        if (!isFiniteNumber(value)) {
            return new Response(`${key} is not a valid number.`, {status: 400});
        }
    }

    const stmt = db.prepare("INSERT INTO purchases (customerId, timestamp, price) VALUES (?, ?, ?)");

    try {
        stmt.run(data.customerId, data.timestamp, data.value);
    }
    catch (e) {
        return new Response("Internal Server Error", {status: 500});
    }

    dbObserver.notify(['purchases']);
    return new Response("Purchase added successfully.");
};