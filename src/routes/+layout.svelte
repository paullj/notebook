<script lang="ts">
	import { browser } from '$app/environment';
	import { room } from '$lib/stores/room.svelte';
	import { me } from '$lib/stores/user.svelte';

	import 'virtual:uno.css';
	import '@unocss/reset/tailwind.css';

	$effect(() => {
		if (!browser) return;
		room.connect('test');
	});

	$effect(() => {
		if (!me.name) return;
		room.setLocalAwareness(me);
	});
</script>

{#if room.isConnected}
	{#if room.users}
		<ul>
			{#each Object.entries(room.users) as [userID, user]}
				{#if userID === room.clientID}
					<li class="flex items-center space-x-1">
						<div class="w-4 h-4 rounded-full" style="background-color: {me.color}" />
						<input type="text" name="username" id="username-input" bind:value={me.name} />
						(me)
					</li>
				{:else}
					<li class="flex items-center space-x-1">
						<div class="w-4 h-4 rounded-full" style="background-color: {user.color}" />
						<div>
							{user.name}
						</div>
					</li>
				{/if}
			{/each}
		</ul>
	{/if}
	<slot />
{:else}
	<div class="">Connecting...</div>
{/if}
