<script lang="ts">
	import { python } from '@codemirror/lang-python';
	import { yCollab } from 'y-codemirror.next';
	import { notebook } from '$lib/stores/notebook.svelte';
	import { room } from '$lib/stores/room.svelte';
	import CodeMirror from '$lib/components/CodeMirror.svelte';
	import type { CellData } from '$lib/types/cell';
	import Cell from './Cell.svelte';
	import Output from './Output.svelte';

	const { id } = $props<Omit<CellData, 'type' | 'content'>>();
	const cell = notebook.getCell(id);
	const output = $derived(notebook.outputs[id] ?? null);
	const intitialContent = cell?.content ?? '';
</script>

{#if cell}
	<div>
		<div class="flex justify-start items-center mb-1 font-mono text-xs">
			<button
				onclick={() => notebook.executeCell(id)}
				class="px-2 py-0.5 bg-blue-400 rounded-sm uppercase text-white"
			>
				Run
			</button>
		</div>
		<Cell>
			<span slot="leftTitle">
				<div class="flex">
					<div class="uppercase font-mono text-xs">Python</div>
				</div>
			</span>
			<span slot="rightTitle">
				[{output?.executionIndex ?? ' '}] Output
				{#if output.excecutionDuration}
					({output.excecutionDuration} ms)
				{/if}
			</span>
			<span slot="leftPanel">
				<CodeMirror
					lang={python()}
					content={intitialContent}
					extensions={[yCollab(cell.syncedContent, room.awareness)]}
				/>
			</span>
			<div slot="rightPanel" class="px-2 py-1 text-xs">
				{#if output}
					{#each output.values as { type, format, value }}
						<Output {type} {format} {value} />
					{:else}
						<p class="text-gray-300 font-mono text-xs">
							Press <code class="px-2 py-0.5 bg-blue-200 text-blue-50 rounded">Run</code> to execute
							this cell.
						</p>
					{/each}
				{:else}
					<p>Error. No output found for this cell!</p>
				{/if}
			</div>
		</Cell>
	</div>
{:else}
	<p>Cell not found</p>
{/if}
