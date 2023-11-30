<script>
	import { notebook } from '$lib/stores/notebook.svelte';
	import MarkdownCell from '$lib/components/MarkdownCell.svelte';
	import PythonCell from '$lib/components/PythonCell.svelte';
	import pydodideService from '$lib/stores/pyodide.svelte';
	import Button from './common/Button.svelte';
	import { room } from '$lib/stores/room.svelte';

	$effect(() => {
		const asyncImport = async () => {
			const PyodideWorker = (await import('$lib/workers/pyodide.worker?worker')).default;
			pydodideService.addWorker(new PyodideWorker());
		};
		asyncImport();
	});
</script>

<header class="bg-white fixed w-screen left-0 top-0 pt-4 pb-3 z-100">
	<div class="px-4 max-w-2xl md:max-w-3xl lg:max-w-5xl mx-auto">
		<div class="flex justify-between items-center space-x-2">
			<div class="flex justify-start items-center space-x-2">
				<Button
					onclick={() => notebook.executeAll()}
					disabled={!pydodideService.isLoaded || notebook.isRunning}>Run All</Button
				>
				<Button onclick={() => {}} disabled={!pydodideService.isLoaded || !notebook.isRunning}
					>Stop</Button
				>
				<Button onclick={() => notebook.addCell('python')}>Add Python</Button>
				<Button onclick={() => notebook.addCell('markdown')}>Add Markdown</Button>
			</div>
		</div>
	</div>
</header>

<div class="flex flex-col space-y-4 mt-12">
	{#if room.isSynced}
		{#each notebook.cells as cell}
			{#if cell.type === 'markdown'}
				<MarkdownCell id={cell.id} content={cell.content} />
			{:else}
				<PythonCell id={cell.id} />
			{/if}
		{/each}
	{:else}
		<p>Opening notebook...</p>
	{/if}
</div>
