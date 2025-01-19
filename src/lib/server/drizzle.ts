import * as schema from "$schema/database";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { ZERO_UPSTREAM_DB } from "$env/static/private"

const connection = postgres(ZERO_UPSTREAM_DB)
export const database = drizzle(connection, {
  schema
});
