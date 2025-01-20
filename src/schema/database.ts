import { pgEnum, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('user', {
	id: uuid('id').primaryKey().unique(),
});

export const usersRelations = relations(users, ({ many }) => ({
	notebooks: many(notebooks)
}));

export const notebooks = pgTable('notebook', {
	id: uuid('id').primaryKey().unique(),
	creatorID: uuid('creator_id').references(() => users.id, { onDelete: "cascade" }),
});

export const notebooksRelations = relations(notebooks, ({ one, many }) => ({
	creator: one(users, {
		fields: [notebooks.creatorID],
		references: [users.id],
	}),
	cells: many(cell)
}));

export const cellType = pgEnum('cell_type', ['code', 'markdown']);

export const cell = pgTable('cell', {
	id: uuid('id').primaryKey().unique(),
	rank: text('rank').notNull(),
	notebookID: uuid('notebook_id').references(() => notebooks.id, { onDelete: "cascade" }),
	content: text('content').default("").notNull(),
	type: cellType("type").notNull().default("code"),
}, (t) => ({
	notebookIdRankUnique: unique().on(t.rank, t.notebookID),
}));

export const cellRelations = relations(cell, ({ one }) => ({
	notebook: one(notebooks, {
		fields: [cell.notebookID],
		references: [notebooks.id],
	}),
}));
