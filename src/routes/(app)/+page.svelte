<script lang="ts">
	import { zero, Query } from '$lib/zero';
	import { Rank } from '$lib/utils/rank';
	import { Button } from '$lib/components/button';
	import { draggable, droppable, type DragDropState, dndState } from '@thisux/sveltednd';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	const notebook = new Query(
		zero.query.notebook
			.where('creator_id', '=', zero.userID)
			.one()
			.related('creator')
			.related('cells', (cells) => cells.orderBy('rank', 'asc'))
	);
	const rank = new Rank();
	const cellLength = $derived(notebook.data?.cells.length ?? 0);

	$effect(() => {
		if (notebook.data != null) return;
		if (notebook.status === 'unknown') return;

		zero.mutate.notebook.insert({
			id: crypto.randomUUID(),
			creator_id: zero.userID
		});
	});

	function handleDrop({ draggedItem, targetContainer }: DragDropState<{ id: string }>) {
		if (targetContainer == null) return;

		zero.mutate.cell.update({
			id: draggedItem.id,
			rank: targetContainer
		});
	}

	function moveCell(id: string, target: number, placement: 'above' | 'below') {
		if (notebook.data == null) return;

		const indexBefore = placement === 'above' ? target - 1 : target;
		const indexAfter = placement === 'above' ? target : target + 1;

		const before = indexBefore >= 0 ? notebook.data.cells[indexBefore] : null;
		const after = indexAfter < cellLength ? notebook.data.cells[indexAfter] : null;

		const [newRank, success] = rank.insert(before?.rank ?? null, after?.rank ?? null);

		if (!success) return;

		zero.mutate.cell.update({
			id: id,
			rank: newRank
		});
	}

	function insertCell(type: 'code' | 'markdown', before: string | null, after: string | null) {
		if (notebook.data == null) return;

		const [value, success] = rank.insert(before, after);

		if (!success) return;

		zero.mutate.cell.insert({
			id: crypto.randomUUID(),
			notebook_id: notebook.data?.id,
			rank: value,
			content: type === 'code' ? 'print("Hello, World!")' : '# Hello, World!',
			type
		});
	}

	function deleteCell(id: string) {
		zero.mutate.cell.delete({ id });
	}

	function updateCell(id: string, content: string) {
		zero.mutate.cell.update({
			id: id,
			content: content
		});
	}
</script>

{#snippet dropLine(before: string | null, after: string | null)}
	{@const [newRank, success] = rank.insert(before, after)}
	{@const disabled = dndState.isDragging && [before, after].includes(dndState.draggedItem.rank)}
	<div
		class="group h-1.5 rounded-sm bg-muted transition-opacity duration-100"
		class:opacity-0={!dndState.isDragging || !success || disabled}
		class:bg-primary={dndState.targetContainer === newRank}
		use:droppable={{
			disabled: !success || disabled,
			container: newRank,
			callbacks: { onDrop: handleDrop }
		}}
	></div>
{/snippet}

{#snippet newBlock(text: string, before: string | null, after: string | null, alwaysShow = false)}
	<div class="group flex items-center justify-start text-xs">
		{#if text}
			<p class="mr-1 group-hover:opacity-100" class:opacity-10={!alwaysShow}>
				{text}
			</p>
		{/if}
		<div class="group-hover:opacity-100" class:opacity-10={!alwaysShow}>
			<Button size="xs" variant="ghost" onclick={() => insertCell('code', before, after)}>
				<p class="text-xs font-light">Python</p>
			</Button>
			<Button size="xs" variant="ghost" onclick={() => insertCell('markdown', before, after)}>
				<p class="text-xs font-light">Markdown</p>
			</Button>
		</div>
	</div>
{/snippet}

<div class="space-y-4">
	{#if notebook.status == 'complete'}
		{#if cellLength === 0}
			{@render newBlock('Add a new cell,', '0', null, true)}
		{:else}
			{@render newBlock('Insert', '0', notebook.data?.cells[0].rank ?? null)}
			{@render dropLine('0', notebook.data?.cells[0].rank ?? null)}
		{/if}

		{#each notebook.data?.cells ?? [] as cell, index (cell.id)}
			{@const after =
				index < cellLength - 1 ? (notebook.data?.cells.at(index + 1)?.rank ?? null) : null}

			<div
				animate:flip={{ duration: 75 }}
				in:fade={{ delay: index < cellLength - 1 ? 100 : 0, duration: 75 }}
				out:fade={{ duration: 75 }}
			>
				<div
					class="rounded-lg border p-2 font-mono"
					use:draggable={{
						container: cell.rank,
						dragData: cell,
						attributes: {
							draggingClass: 'opacity-40 ring ring-primary'
						}
					}}
				>
					<textarea
						class="w-full"
						value={cell.content}
						onchange={(e) => updateCell(cell.id, e.currentTarget.value)}
					></textarea>
				</div>
				<div class="my-0.5 flex items-center justify-between space-x-1">
					<div class="flex-grow justify-self-start">
						{@render newBlock(after === null ? 'Add' : 'Insert', cell.rank, after, after === null)}
					</div>
					<p class="font-mono text-xs text-muted">
						{cell.rank}
					</p>
					<Button
						size="xs"
						variant="ghost"
						disabled={index === 0}
						onclick={() => moveCell(cell.id, index - 1, 'above')}
					>
						<span class="iconify lets-icons--expand-up-light"></span>
					</Button>
					<Button
						size="xs"
						variant="ghost"
						disabled={index === cellLength - 1}
						onclick={() => moveCell(cell.id, index + 1, 'below')}
					>
						<span class="iconify lets-icons--expand-down-light"></span>
					</Button>
					<Button size="xs" variant="ghost" onclick={() => deleteCell(cell.id)}>
						<span class="iconify lets-icons--trash-light text-destructive"></span>
					</Button>
				</div>
				{@render dropLine(cell.rank, after)}
			</div>
		{/each}
	{/if}
</div>
