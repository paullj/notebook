<script lang="ts">
	import { zero, Query } from '$lib/zero';

	const notebook = new Query(
		zero.query.notebook
			.where('creator_id', '=', zero.userID)
			.one()
			.related('cells')
			.related('creator')
	);

	$effect(() => {
		if (zero.userID === 'anon') {
			console.log('Not found');
			return;
		}
		if (notebook.data != null) {
			console.log('Notebook found');
			return;
		}
		if (notebook.status === 'unknown') {
			console.log('Loading notebook');
			return;
		}
		console.log('Inserting notebook');
		zero.mutate.notebook.insert({
			id: crypto.randomUUID(),
			creator_id: zero.userID
		});
	});

	function insertCell(type: 'python' | 'markdown') {
		if (notebook.data == null) return;

		zero.mutate.cell.insert({
			id: notebook.data?.cells.length ?? 0,
			index: notebook.data?.cells.length ?? 0,
			notebook_id: notebook.data?.id,
			content: 'print("Hello, World!")',
			type: 'code'
		});
	}
</script>

<div>
	{#if notebook.status == 'complete'}
		<h3>
			{notebook.data?.id} by {notebook.data?.id.slice(0, 6)}
		</h3>
		{#each notebook.data?.cells ?? [] as cell}
			<div>
				{cell.content}
			</div>
		{/each}
		<div>
			<button onclick={() => insertCell('python')}> Python </button>
			<button onclick={() => insertCell('markdown')}> Markdown </button>
		</div>
	{/if}
</div>
