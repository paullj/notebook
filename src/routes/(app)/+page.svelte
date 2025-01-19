<script lang="ts">
	import { Button } from '$lib/components/button';
	import { zero, Query } from '$lib/zero';
	import Trash from 'phosphor-svelte/lib/Trash';
	import Code from 'phosphor-svelte/lib/Code';
	import Markdown from 'phosphor-svelte/lib/MarkdownLogo';
	import { cellRelations } from '$schema/database';

	const notebook = new Query(
		zero.query.notebook
			.where('creator_id', '=', zero.userID)
			.one()
			.related('creator')
			.related('cells', (cells) => cells.orderBy('index', 'asc'))
	);

	$effect(() => {
		if (notebook.data != null) return;
		if (notebook.status === 'unknown') return;

		zero.mutate.notebook.insert({
			id: crypto.randomUUID(),
			creator_id: zero.userID
		});
	});

	function insertCell(type: 'code' | 'markdown') {
		if (notebook.data == null) return;

		zero.mutate.cell.insert({
			id: crypto.randomUUID(),
			index: notebook.data?.cells.length ?? 0,
			notebook_id: notebook.data?.id,
			content: type === 'code' ? 'print("Hello, World!")' : '# Hello, World!',
			type
		});
	}
	function deleteCell(id: string) {
		zero.mutate.cell.delete({ id });
	}
</script>

<div>
	{#if notebook.status == 'complete'}
		{#each notebook.data?.cells ?? [] as cell}
			<div>
				<div class="rounded bg-muted p-2">
					{#if cell.type === 'code'}
						<pre>{cell.content}</pre>
					{:else}
						{cell.content}
					{/if}
				</div>
				<div class="flex justify-end">
					<div>
						{cell.index}
					</div>
					<Button size="icon" variant="ghost" onclick={() => deleteCell(cell.id)}>
						<Trash class="text-destructive" />
					</Button>
				</div>
			</div>
		{/each}

		<div class="flex items-center justify-center space-x-2">
			<p>Add</p>
			<Button size="sm" onclick={() => insertCell('code')}>
				<Code />
			</Button>
			<Button size="sm" onclick={() => insertCell('markdown')}>
				<Markdown />
			</Button>
		</div>
	{/if}
</div>
