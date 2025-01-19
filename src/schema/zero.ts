import { ANYONE_CAN, createSchema, definePermissions, NOBODY_CAN, type ExpressionBuilder } from "@rocicorp/zero";
import { createZeroSchema } from "drizzle-zero";
import * as drizzleSchema from "./database";

// Convert to Zero schema
export const schema = createSchema(
  createZeroSchema(drizzleSchema, {
    version: 1,
    // Specify which tables and columns to include in the Zero schema.
    // This allows for the "expand/migrate/contract" pattern recommended in the Zero docs.
    // When a column is first added, it should be set to false, and then changed to true
    // once the migration has been run.
    tables: {
      user: {
        id: true,
      },
      notebook: {
        id: true,
        creator_id: true,
      },
      cell: {
        id: true,
        index: true,
        content: true,
        notebook_id: true,
        type: true,
      }
    },
  }),
);

// Define permissions with the inferred types from Drizzle
export type Schema = typeof schema;
export type User = typeof schema.tables.user;
export type Notebook = typeof schema.tables.notebook;
export type Cell = typeof schema.tables.cell;

type DecodedJWT = {
  // The logged-in user_id.
  sub: string;
};

export const permissions = definePermissions<DecodedJWT, Schema>(schema, () => {
  const allowIfSelf = ({ sub }: DecodedJWT, { cmp }: ExpressionBuilder<User>) => cmp('id', '=', sub);
  const allowIfCreatorIsSelf = ({ sub }: DecodedJWT, { cmp }: ExpressionBuilder<Notebook>) => cmp('creator_id', '=', sub);

  return {
    user: {
      row: {
        select: [allowIfSelf],
        insert: NOBODY_CAN,
        update: {
          preMutation: NOBODY_CAN,
          postMutation: NOBODY_CAN,
        },
        delete: NOBODY_CAN,
      }
    },
    cell: {
      row: ANYONE_CAN,
    },
    notebook: {
      row: {
        select: [allowIfCreatorIsSelf],
        insert: ANYONE_CAN,
        update: {
          preMutation: [allowIfCreatorIsSelf],
          postMutation: [allowIfCreatorIsSelf],
        },
        delete: [allowIfCreatorIsSelf],
      }
    }
  }
});
