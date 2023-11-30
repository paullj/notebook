<script lang="ts">
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	type ButtonVariants = keyof typeof variants;
	type ButtonSizes = keyof typeof sizes;

	const sizes = {
		sm: 'text-xs',
		md: 'text-7xl',
		lg: 'text-base'
	};

	const variants = {
		primary: '',
		danger: 'text-red-300 hover:text-red-600'
	};

	type ButtonProps = HTMLAnchorAttributes &
		HTMLButtonAttributes & {
			size?: ButtonSizes;
			variant?: ButtonVariants;
		};

	const {
		href,
		type,
		size = 'md',
		variant = 'primary',
		class: className,
		...restProps
	} = $props<ButtonProps>();

	let baseClass =
		'inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
	baseClass += 'h-7 px-2 py-1';
	// baseClass += ' bg-gray-200 text-gray-900';
	baseClass += variants[variant];
	baseClass += sizes[size];
</script>

{#if href}
	<a
		class="{baseClass} {sizes[size]} {variants[variant]} {className}"
		{href}
		tabindex="0"
		{...restProps}
	>
		<slot />
	</a>
{:else}
	<button class="{baseClass} {className}" {type} tabindex="0" {...restProps}>
		<slot />
	</button>
{/if}
