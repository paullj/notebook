
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { dev } from "$app/environment"
import * as jwt from '$lib/auth/jwt';
import * as schema from '$schema/database';
import { database } from '$lib/server/drizzle';
import type { RequestHandler } from './$types';

const createUser = async () => {
  const userID = crypto.randomUUID();
  await database.insert(schema.users).values({ id: userID });
  const token = await jwt.create(userID)
  return [userID, token];
}

const getUser = async (authorizationToken: string) => {
  const token = authorizationToken.split(" ")[1];
  const decoded = await jwt.verify(token);
  const user = await database.query.users.findFirst({
    where: eq(schema.users.id, decoded.sub)
  });
  if (!user) {
    return [null, null];
  } else {
    return [user.id, token];
  }
}

export const GET: RequestHandler = async ({ cookies }) => {
  const authorization = cookies.get("Authorization") || null;
  let [userID, token] = authorization ? await getUser(authorization) : [null, null];

  if (!userID || !token) {
    [userID, token] = await createUser();
  }

  cookies.set(
    "Authorization", `Bearer ${token}`, {
    httpOnly: true,
    secure: !dev,
    sameSite: 'strict',
    path: '/',
    maxAge: 15 * 60
  });

  return json({ userID, token }, { status: 201 });
};
