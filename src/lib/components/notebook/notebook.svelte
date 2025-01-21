<script lang="ts">
	import { zero } from '$lib/zero';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Cell from '$lib/components/notebook/cell';
	import { draggable, droppable, type DragDropState, dndState } from '@thisux/sveltednd';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { Trash2, ChevronDown, ChevronUp, CornerDownRight, CornerUpRight } from 'lucide-svelte';
	import { Notebook } from '$lib/state/notebook.svelte';
	import { insert } from '$lib/utils/rank';

	const notebook = new Notebook(
		zero.query.notebook
			.where('creator_id', '=', zero.userID)
			.related('cells', (cells) => cells.orderBy('rank', 'asc'))
			.related('creator')
			.one()
	);

	function handleDrop({ draggedItem, targetContainer }: DragDropState<{ id: string }>) {
		if (targetContainer == null) return;

		notebook.updateCell({
			id: draggedItem.id,
			rank: targetContainer
		});
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
				onclick={() => notebook.insertCell({ type: 'code', prev, next })}
			>
				<p class="text-xs">Python</p>
			</Button>
			<Button
				size="xs"
				variant="outline"
				tooltip="Add Markdown cell"
				onclick={() => notebook.insertCell({ type: 'markdown', prev, next })}
			>
				<p class="text-xs">Markdown</p>
			</Button>
		</div>
	</div>
{/snippet}

<div class="space-y-1">
	{#if notebook.id != null}
		<div class="font-lighter mb-4 flex items-center text-xs">
			<p>Notebook ID:</p>
			<Badge variant="outline">{notebook.id}</Badge>
		</div>
		{#if notebook.length === 0}
			<Cell.EmptyAlert onInsert={(type) => notebook.insertCell({ type, prev: '0' })} />
		{:else}
			<div class="relative">
				{@render newCell('Insert', '0', notebook.cells[0].rank ?? null, 'hide', 'above')}
				{@render dropLine('0', notebook.cells[0].rank ?? null)}
			</div>
		{/if}

		{#each notebook.cells ?? [] as cell, index (cell.id)}
			{@const after =
				index < notebook.length - 1 ? (notebook.cells.at(index + 1)?.rank ?? null) : null}

			<div
				animate:flip={{ duration: 75 }}
				in:fade={{ delay: index < notebook.length - 1 ? 100 : 0, duration: 75 }}
				out:fade={{ duration: 75 }}
			>
				<div
					class="transition-transform duration-100 hover:scale-[1.005]"
					use:draggable={{
						container: cell.rank,
						dragData: cell,
						attributes: {
							draggingClass: 'opacity-40 ring ring-ring'
						}
					}}
				>
					<Cell.Cell {cell} onUpdate={(id, content) => notebook.updateCell({ id, content })} />
				</div>
				<div class="relative mt-1 pb-2">
					<div
						class="flex items-center justify-between space-x-1"
						class:opacity-0={dndState.isDragging}
					>
						<div class="flex-grow justify-self-start">
							{@render newCell(
								after === null ? 'Add' : 'Insert',
								cell.rank,
								after,
								after === null ? 'alwaysShow' : 'hide'
							)}
						</div>
						<Button
							size="xs"
							variant="ghost"
							disabled={index === 0}
							tooltip="Move cell up"
							onclick={() =>
								notebook.moveCell({ id: cell.id, target: index - 1, placement: 'above' })}
						>
							<ChevronUp strokeWidth={1} absoluteStrokeWidth />
						</Button>
						<Button
							size="xs"
							variant="ghost"
							disabled={index === notebook.length - 1}
							tooltip="Move cell down"
							onclick={() =>
								notebook.moveCell({ id: cell.id, target: index + 1, placement: 'below' })}
						>
							<ChevronDown strokeWidth={1} absoluteStrokeWidth />
						</Button>
						<Button
							size="xs"
							variant="ghost"
							onclick={() => notebook.deleteCell(cell.id)}
							tooltip="Delete cell"
						>
							<Trash2 strokeWidth={1} class="text-destructive" absoluteStrokeWidth />
						</Button>
					</div>
					{#if dndState.isDragging}
						{@render dropLine(cell.rank, after)}
					{/if}
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.dropLineHover {
		@apply bg-blue-500 dark:bg-blue-700;
	}
</style>
