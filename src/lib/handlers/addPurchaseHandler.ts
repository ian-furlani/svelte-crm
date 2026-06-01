export async function addPurchaseHandler(customers, customerId: number, inputAmount: string | null) {
    if (inputAmount == null) {
        throw new Error("Value of purchase cannot be null.");
    }

    const amount = Number.parseFloat(inputAmount);
    
    if (Number.isNaN(amount)) {
        throw new Error("Input is not a number");
    };

    if (amount < 0) {
        throw new Error("Cannot add a purchase of negative value to a customer.");
    }

    for (const c of customers) {
        if (c.id === customerId) {
            c.total += amount;
            break;
        }
    }
}