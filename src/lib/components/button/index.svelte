<script lang="ts">
	import { Button as Primative } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { type ButtonProps, buttonVariants } from './index';
	import { twMerge } from 'tailwind-merge';

	type Props = {
		children: Snippet;
		class?: string;
	} & ButtonProps &
		Primative.RootProps;

	const { children, class: className, variant, size, ...props }: Props = $props();
</script>

<Primative.Root class={twMerge(buttonVariants({ variant, size }), className)} {...props}>
	{@render children()}
</Primative.Root>
