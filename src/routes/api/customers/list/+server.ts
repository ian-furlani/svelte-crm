import db from "$lib/db";
import {json} from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = ({url}) => {
    const params = new URLSearchParams(url.search);
    let limit = 50;
    let page = 0;

    const limitParam = params.get("limit");
    const pageParam = params.get("page");
    const query = params.get("query") ?? "";

    if (limitParam != null) limit = Number.parseInt(limitParam);
    if (pageParam != null) page = Number.parseInt(pageParam);

    if (Number.isNaN(limit) || Number.isNaN(page)) {
        return new Response("Invalid parameter value", {status: 400});
    }

    const stmt = db.prepare("SELECT id, name, last_name as lastName, email, total_purchased as totalPurchased FROM customers_stats WHERE CONCAT(name, ' ', last_name) LIKE ? LIMIT ? OFFSET ?;");
    return json(stmt.all(`%${query}%`, limit, page*limit));
};