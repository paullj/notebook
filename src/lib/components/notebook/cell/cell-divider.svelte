<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { droppable, type DragDropState, dndState } from '@thisux/sveltednd';
	import { Trash2, ChevronDown, ChevronUp, CornerDownRight, CornerUpRight } from 'lucide-svelte';
	import { insert } from '$lib/utils/rank';
	import type {
		InsertCellFn,
		UpdateCellFn,
		MoveCellFn,
		DeleteCellFn
	} from '$lib/state/notebook.svelte';

	type Props = {
		onUpdate: UpdateCellFn;
		onInsert: InsertCellFn;
		onMove: MoveCellFn;
		onDelete: DeleteCellFn;
		id?: string;
		index?: number;
		prev?: string | null;
		next?: string | null;
	};

	const {
		onUpdate,
		onInsert,
		onMove,
		onDelete,
		id = undefined,
		index = undefined,
		prev = null,
		next = null
	}: Props = $props();

	const first = $derived(index === 0);
	const last = $derived(next === null);

	function handleDrop({ draggedItem, targetContainer }: DragDropState<{ id: string }>) {
		if (targetContainer == null) return;

		onUpdate({ id: draggedItem.id, rank: targetContainer });
	}
</script>

{#snippet dropLine(before: string | null, after: string | null)}
	{@const [newRank, success] = insert(before, after)}
	{@const disabled =
		!success || (dndState.isDragging && [before, after].includes(dndState.draggedItem.rank))}
	<div
		class="group bg-muted absolute inset-0 my-auto h-2 w-full rounded-sm transition-opacity duration-100"
		class:opacity-0={!dndState.isDragging || disabled}
		class:bg-accent={dndState.targetContainer === newRank}
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
				onclick={() => onInsert({ type: 'code', prev, next })}
			>
				<p class="text-xs">Python</p>
			</Button>
			<Button
				size="xs"
				variant="outline"
				tooltip="Add Markdown cell"
				onclick={() => onInsert({ type: 'markdown', prev, next })}
			>
				<p class="text-xs">Markdown</p>
			</Button>
		</div>
	</div>
{/snippet}

<div class="relative mt-1 pb-2">
	<div class="flex items-center justify-between space-x-1" class:opacity-0={dndState.isDragging}>
		<div class="grow justify-self-start">
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
				onclick={() => onMove({ id, target: index - 1, placement: 'above' })}
			>
				<ChevronUp strokeWidth={1} absoluteStrokeWidth />
			</Button>
			<Button
				size="xs"
				variant="ghost"
				disabled={last}
				tooltip="Move cell down"
				onclick={() => onMove({ id, target: index + 1, placement: 'below' })}
			>
				<ChevronDown strokeWidth={1} absoluteStrokeWidth />
			</Button>
			<Button size="xs" variant="ghost" onclick={() => onDelete(id)} tooltip="Delete cell">
				<Trash2 strokeWidth={1} class="text-destructive" absoluteStrokeWidth />
			</Button>
		{/if}
	</div>
	{#if dndState.isDragging}
		{@render dropLine(prev, next)}
	{/if}
</div>
