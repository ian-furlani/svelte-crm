import Database from "better-sqlite3";

const db = new Database("customers.db");
export default db;

const query = `CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY,
        customerId INTEGER NOT NULL,
        timestamp INTEGER,
        price INTEGER,
        FOREIGN KEY (customerId) REFERENCES customers(id)
    );

    CREATE VIEW IF NOT EXISTS customers_stats AS SELECT customers.*, COALESCE(SUM(purchases.price), 0) as total_purchased FROM CUSTOMERS LEFT JOIN purchases on customers.id=purchases.customerId GROUP BY customers.id;
`;

db.exec(query);