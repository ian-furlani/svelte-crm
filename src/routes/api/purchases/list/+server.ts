import db from "$lib/db";
import { json, type RequestHandler } from "@sveltejs/kit";

const DEFAULT_LIMIT = 50;

export const GET: RequestHandler = ({ url }) => {
    const params = new URLSearchParams(url.search);
    const customerId = params.get("customerId");
    const page = params.get("page") ?? 0;
    const limit = params.get("limit") ?? DEFAULT_LIMIT;
    
    if (customerId == null) {
        return new Response("Missing paramters.", {status: 400});
    }

    const stmt = db.prepare(`SELECT * from purchases WHERE customerId = ? LIMIT ? OFFSET ?;`);
    const result = stmt.all(customerId, limit, page);
    return json(result);
}