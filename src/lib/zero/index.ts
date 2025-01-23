import { Zero } from './zero.svelte';
import { Query } from './query.svelte';

import { env } from '$env/dynamic/public';
import { schema, type Schema } from '$schema/zero';
import type { ZeroOptions } from '@rocicorp/zero';
import { ANON_USER_ID } from '$lib/constants';

if (!env.PUBLIC_ZERO_SERVER_URL) throw new Error('PUBLIC_ZERO_SERVER_URL is not set');

const config = {
  server: env.PUBLIC_ZERO_SERVER_URL,
  schema,
  userID: ANON_USER_ID,
} satisfies ZeroOptions<Schema>;

const zero = new Zero<Schema>(config);

zero.connect(async () => {
  const repsonse = await fetch("/auth");
  if (!repsonse.ok) return false;
  const { userID, token } = await repsonse.json();
  localStorage.setItem("userID", userID);
  return {
    ...config,
    userID,
    auth: token
  };
});

export { zero, Query };
