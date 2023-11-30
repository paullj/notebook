<script lang="ts">
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type ButtonProps = HTMLAnchorAttributes & HTMLButtonAttributes & {};

	const { href, type, class: className, ...restProps } = $props<ButtonProps>();
</script>

{#if href}
	<a
		class="text-xs font-mono uppercase rounded-sm px-2 py-1 text-white bg-blue-400 disabled:opacity-80 {className}"
		{href}
		tabindex="0"
		{...restProps}
	>
		<slot />
	</a>
{:else}
	<button
		class="text-xs font-mono uppercase rounded-sm px-2 py-1 text-white bg-blue-400 disabled:opacity-80"
		{type}
		tabindex="0"
		{...restProps}
	>
		<slot />
	</button>
{/if}
