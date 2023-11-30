import { browser } from '$app/environment';
import { room } from '$lib/stores/room.svelte';
import type { PageLoad } from './$types';

export const load = (async () => {
  if (browser) {
    room.load();
  }

  return {};
}) satisfies PageLoad;