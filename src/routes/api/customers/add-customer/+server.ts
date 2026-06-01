import db from "$lib/db";
import { dbObserver } from "$lib/server/db-observer";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
    const json = await request.json();

    if (json.firstName == null || json.lastName == null || json.email == null) {
        return new Response("Fields cannot be null", {status: 400});
    }

    const stmt = db.prepare("INSERT INTO CUSTOMERS (name, last_name, email) VALUES (?, ?, ?)");
    stmt.run(json.firstName, json.lastName, json.email);

    dbObserver.notify(['customers']);
    return new Response("Customer added successfully.");
}