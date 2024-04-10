import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./lib/db";

const doThisShit = async () => {
  console.log("migrating...");

  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("done");
};

doThisShit();
