import type { Handle } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { database } from "$lib/server/drizzle";
import * as jwt from '$lib/utils/jwt';
import * as schema from './schema/database';

export const handle: Handle = async ({ event, resolve }) => {
  const authorization = event.cookies.get("Authorization");

  if (authorization) {
    const token = authorization.split(" ")[1];

    try {
      const decoded = await jwt.verify(token);
      if (typeof decoded === "string") {
        throw new Error("Something went wrong");
      }

      const user = await database.query.users.findFirst({
        where: eq(schema.users.id, decoded.sub)
      });

      if (!user) {
        throw new Error("User not found");
      }

      event.locals.sessionUserID = user.id;
    } catch (error) {
      console.error(error);
    }
  }

  return await resolve(event);
};
