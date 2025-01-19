import { defineConfig } from 'drizzle-kit';

if (!process.env.ZERO_UPSTREAM_DB) {
	throw new Error('Missing environment variable ZERO_UPSTREAM_DB');
}

export default defineConfig({
	schema: './src/schema/database.ts',
	dialect: 'postgresql',
	out: './database',
	dbCredentials: {
		url: process.env.ZERO_UPSTREAM_DB
	},
	verbose: true,
	strict: true
});
