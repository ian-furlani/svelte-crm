type Controller = ReadableStreamDefaultController;

class DatabaseObserver {
    private subscribers = new Map<string, Set<Controller>>();

    subscribe(tables: string[], controller: Controller) {
        for (const table of tables) {
            if (!this.subscribers.has(table)) {
                this.subscribers.set(table, new Set());
            }

            this.subscribers.get(table)!.add(controller);
        }
    }

    unsubscribe(tables: string[], controller: Controller) {
        for (const table of tables) {
            if (!this.subscribers.has(table)) continue;
            this.subscribers.get(table)?.delete(controller);
        }
    }

    // Notify subscribers when the tables they are subscribed to change
    notify(tables: string[]) {
        for (const table of tables) {
            const controllers = this.subscribers.get(table);
            const deadControllers = new Set<Controller>();

            if (!controllers) continue;

            const payload = `data: ${JSON.stringify({table})}\n\n`;

            for (const ctrl of controllers) {
                try {
                    ctrl.enqueue(payload);
                }
                catch (e) {
                    deadControllers.add(ctrl);
                }
            }

            // Delete all dead controllers from the set
            deadControllers.forEach(ctrl => controllers.delete(ctrl));
        }
    }
}

export const dbObserver = new DatabaseObserver();