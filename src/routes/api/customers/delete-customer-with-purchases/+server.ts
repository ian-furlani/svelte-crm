import db from "$lib/db";
import { isFiniteNumber } from "$lib/helpers/helpers";
import { dbObserver } from "$lib/server/db-observer";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
    const json = await request.json();

    if (!json.customerId) {
        return new Response("customerId is required.", {status: 400});
    }

    if (!isFiniteNumber(json.customerId)) {
        return new Response("customerId is not a valid number!", {status: 400});
    }

    const deletePurchases = db.prepare("DELETE FROM purchases WHERE purchases.customerId = (?)");
    const deleteCustomer = db.prepare("DELETE FROM customers WHERE (customers.id = (?))");

    const deleteCustomerWithPurchases = db.transaction((customerId) => {
        deletePurchases.run(customerId);
        deleteCustomer.run(customerId);
    });

    deleteCustomerWithPurchases(json.customerId);

    dbObserver.notify(['customers', 'purchases']);
    return new Response("Customer added successfully.");
}