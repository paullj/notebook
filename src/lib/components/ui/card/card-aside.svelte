<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';

	export const variants = tv({
		base: 'absolute',
		variants: {
			side: {
				left: '-ml-1',
				right: 'mr-1'
			},
			size: {
				sm: 'w-20',
				md: 'w-28',
				lg: '2-36'
			}
		},
		compoundVariants: [
			{
				side: 'left',
				size: 'sm',
				className: '-left-20'
			},
			{
				side: 'left',
				size: 'md',
				className: '-left-28'
			},
			{
				side: 'left',
				size: 'lg',
				className: '-left-36'
			},
			{
				side: 'right',
				size: 'sm',
				className: '-right-20'
			},
			{
				side: 'right',
				size: 'md',
				className: '-right-28'
			},
			{
				side: 'right',
				size: 'lg',
				className: '-right-36'
			}
		],
		defaultVariants: {
			side: 'left',
			size: 'md'
		}
	});

	export type SideVariant = VariantProps<typeof variants>['side'];
	export type SizeVariant = VariantProps<typeof variants>['size'];
</script>

<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		size = 'md',
		side = 'left',
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		size?: SizeVariant;
		side?: SideVariant;
	} = $props();
</script>

<div class="relative float-end w-full {className}">
	<div bind:this={ref} class={cn(variants({ size, side }))} {...restProps}>
		{@render children?.()}
	</div>
</div>
