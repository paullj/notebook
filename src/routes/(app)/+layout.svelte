<script lang="ts">
	import { type Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { zero } from '$lib/zero';

	type Props = { data: LayoutData; children: Snippet };
	let { data, children }: Props = $props();
</script>

<div class="h-screen w-screen">
	{#if zero.userID === 'anon'}
		<!-- TODO: Find a better way of doing this, its not particularly elegant -->
		<p>Loading</p>
	{:else}
		{@render children()}
	{/if}
</div>
