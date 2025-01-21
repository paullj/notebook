<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { droppable, type DragDropState, dndState } from '@thisux/sveltednd';
	import { Trash2, ChevronDown, ChevronUp, CornerDownRight, CornerUpRight } from 'lucide-svelte';
	import { insert } from '$lib/utils/rank';

	type UpdateCellFn = (id: string, rank: string) => void;
	type InsertCellFn = (type: 'code' | 'markdown', prev: string | null, next: string | null) => void;
	type MoveCellFn = (id: string, target: number, placement: 'above' | 'below') => void;
	type deleteCellFn = (id: string) => void;

	type Props = {
		updateCell: UpdateCellFn;
		insertCell: InsertCellFn;
		moveCell: MoveCellFn;
		deleteCell: deleteCellFn;
		id?: string;
		index?: number;
		prev?: string | null;
		next?: string | null;
	};

	const {
		updateCell,
		insertCell,
		moveCell,
		deleteCell,
		id = undefined,
		index = undefined,
		prev = null,
		next = null
	}: Props = $props();
	const first = $derived(index === 0);
	const last = $derived(next === null);

	function handleDrop({ draggedItem, targetContainer }: DragDropState<{ id: string }>) {
		if (targetContainer == null) return;

		updateCell(draggedItem.id, targetContainer);
	}
</script>

{#snippet dropLine(before: string | null, after: string | null)}
	{@const [newRank, success] = insert(before, after)}
	{@const disabled =
		!success || (dndState.isDragging && [before, after].includes(dndState.draggedItem.rank))}
	<div
		class="group absolute inset-0 my-auto h-2 w-full rounded-sm bg-muted transition-opacity duration-100"
		class:opacity-0={!dndState.isDragging || disabled}
		class:dropLineHover={dndState.targetContainer === newRank}
		use:droppable={{
			disabled,
			container: newRank,
			callbacks: { onDrop: handleDrop }
		}}
	></div>
{/snippet}

{#snippet newCell(
	children: string,
	prev: string | null,
	next: string | null,
	show: 'alwaysShow' | 'hide' = 'hide',
	direction: 'below' | 'above' | 'none' = 'below'
)}
	<div class="group flex items-center justify-start text-xs" class:opacity-0={dndState.isDragging}>
		<div
			class="mr-2 flex flex-row items-center justify-start transition-opacity duration-100 group-hover:opacity-100"
			class:opacity-30={show !== 'alwaysShow'}
		>
			{#if direction === 'below'}
				<CornerDownRight strokeWidth={1} absoluteStrokeWidth class="h-4" />
			{:else if direction === 'above'}
				<CornerUpRight strokeWidth={1} absoluteStrokeWidth class="h-4" />
			{/if}
			{#if children}
				<p>
					{children}
				</p>
			{/if}
		</div>
		<div class="group-hover:opacity-100" class:opacity-0={show !== 'alwaysShow'}>
			<Button
				size="xs"
				variant="outline"
				tooltip="Add Python cell"
				onclick={() => insertCell('code', prev, next)}
			>
				<p class="text-xs">Python</p>
			</Button>
			<Button
				size="xs"
				variant="outline"
				tooltip="Add Markdown cell"
				onclick={() => insertCell('markdown', prev, next)}
			>
				<p class="text-xs">Markdown</p>
			</Button>
		</div>
	</div>
{/snippet}

<div class="relative mt-1 pb-2">
	<div class="flex items-center justify-between space-x-1" class:opacity-0={dndState.isDragging}>
		<div class="flex-grow justify-self-start">
			{@render newCell(
				last ? 'Add' : 'Insert',
				prev,
				next,
				last ? 'alwaysShow' : 'hide',
				index == null ? 'above' : 'below'
			)}
		</div>
		{#if index != null && id != null}
			<Button
				size="xs"
				variant="ghost"
				disabled={first}
				tooltip="Move cell up"
				onclick={() => moveCell(id, index - 1, 'above')}
			>
				<ChevronUp strokeWidth={1} absoluteStrokeWidth />
			</Button>
			<Button
				size="xs"
				variant="ghost"
				disabled={last}
				tooltip="Move cell down"
				onclick={() => moveCell(id, index + 1, 'below')}
			>
				<ChevronDown strokeWidth={1} absoluteStrokeWidth />
			</Button>
			<Button size="xs" variant="ghost" onclick={() => deleteCell(id)} tooltip="Delete cell">
				<Trash2 strokeWidth={1} class="text-destructive" absoluteStrokeWidth />
			</Button>
		{/if}
	</div>
	{#if dndState.isDragging}
		{@render dropLine(prev, next)}
	{/if}
</div>

<style>
	.dropLineHover {
		@apply bg-blue-500 dark:bg-blue-700;
	}
</style>
