import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not defined");
  process.exit(1);
}

console.log("Running database migrations...");
const migrationClient = postgres(databaseUrl, { max: 1 });
const db = drizzle(migrationClient);

try {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Database migrations completed successfully.");
} catch (error) {
  console.error("Database migration failed:", error);
  process.exit(1);
} finally {
  await migrationClient.end();
}
