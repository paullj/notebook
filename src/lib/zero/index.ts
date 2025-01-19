import { Zero } from './zero.svelte';
import { Query } from './query.svelte';

import { env } from '$env/dynamic/public';
import { schema, type Schema } from '$schema/zero';
import type { ZeroOptions } from '@rocicorp/zero';

if (!env.PUBLIC_ZERO_SERVER_URL) throw new Error('PUBLIC_ZERO_SERVER_URL is not set');

const config = {
  server: env.PUBLIC_ZERO_SERVER_URL,
  schema,
  userID: 'anon',
} satisfies ZeroOptions<Schema>;

const zero = new Zero<Schema>(config);

zero.connect(async () => {
  const { userID, token } = await fetch("/auth").then(res => res.json());
  return {
    ...config,
    userID,
    auth: token
  };
});

export { zero, Query };
