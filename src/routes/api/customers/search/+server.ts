import db from "$lib/db";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = ({url}) => {
    const params = url.searchParams;
    const query = params.get("query") ?? ""; // Default to empty string as query

    // Allows searching for name, last name or name and last name
    const stmt = db.prepare("SELECT * FROM customers WHERE CONCAT(name, ' ', last_name) LIKE ?");
    const results = stmt.all(`%${query}%`);
    return json(results);
}