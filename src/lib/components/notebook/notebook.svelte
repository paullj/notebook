<script lang="ts">
	import { zero } from '$lib/zero';
	import { Badge } from '$lib/components/ui/badge';
	import * as Cell from '$lib/components/notebook/cell';
	import { draggable } from '@thisux/sveltednd';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { Notebook, type CellType, type Placement } from '$lib/state/notebook.svelte';

	const notebook = new Notebook(
		zero.query.notebook
			.where('creator_id', '=', zero.userID)
			.related('cells', (cells) => cells.orderBy('rank', 'asc'))
			.related('creator')
			.one()
	);

	const dividerProps = {
		insertCell: (type: CellType, prev: string | null, next: string | null) =>
			notebook.insertCell({ type, prev, next }),
		moveCell: (id: string, target: number, placement: Placement) =>
			notebook.moveCell({ id, target, placement }),
		updateCell: (id: string, rank: string) => notebook.updateCell({ id, rank }),
		deleteCell: (id: string) => notebook.deleteCell(id)
	};
</script>

<div class="space-y-1">
	{#if notebook.id != null}
		<div class="font-lighter mb-4 flex items-center space-x-2 text-xs">
			<p>Notebook ID:</p>
			<Badge variant="outline" class="font-mono font-thin">{notebook.id}</Badge>
		</div>
		{#if notebook.length === 0}
			<Cell.EmptyAlert onInsert={(type) => notebook.insertCell({ type })} />
		{:else}
			<Cell.Divider {...dividerProps} next={notebook.cells[0].rank} />
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
				<Cell.Divider {...dividerProps} id={cell.id} {index} prev={cell.rank} next={after} />
			</div>
		{/each}
	{/if}
</div>
