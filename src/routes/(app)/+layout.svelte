<script lang="ts">
	import { zero } from '$lib/zero';
	import { ANON_USER_ID } from '$lib/constants';
	import { fade } from 'svelte/transition';

	import { type Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	type Props = { data: LayoutData; children: Snippet };
	let { data, children }: Props = $props();
</script>

<div class="h-screen w-screen px-4 py-4">
	{#if zero.userID === ANON_USER_ID}
		<!-- TODO: Find a better way of doing this, its not particularly elegant -->
	{:else}
		<div in:fade>
			{@render children()}
		</div>
	{/if}
</div>
