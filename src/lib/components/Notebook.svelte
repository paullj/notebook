<script>
	import { notebook } from '$lib/stores/notebook.svelte';
	import MarkdownCell from '$lib/components/MarkdownCell.svelte';
	import PythonCell from '$lib/components/PythonCell.svelte';
	import pydodideService from '$lib/stores/pyodide.svelte';

	$effect(() => {
		const asyncImport = async () => {
			const PyodideWorker = (await import('$lib/workers/pyodide.worker?worker')).default;
			pydodideService.addWorker(new PyodideWorker());
		};
		asyncImport();
	});
</script>

<div class="flex justify-start items-center space-x-4">
	<button onclick={() => notebook.addCell('python')}> Add Python </button>
	<button onclick={() => notebook.addCell('markdown')}> Add Markdown </button>
	<button onclick={() => {}} disabled={!pydodideService.isLoaded}>Run</button>
	<button onclick={() => {}} disabled={!pydodideService.isLoaded}>Stop</button>
</div>

{#each notebook.cells as cell}
	{#if cell.type === 'markdown'}
		<MarkdownCell id={cell.id} content={cell.content} />
	{:else}
		<PythonCell id={cell.id} />
	{/if}
	<div class="flex space-x-2 items-center">
		<p>{cell.type}</p>
		<button onclick={() => notebook.removeCell(cell.id)}>Delete</button>
	</div>
{/each}
