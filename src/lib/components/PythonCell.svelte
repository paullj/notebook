<script lang="ts">
	import { python } from '@codemirror/lang-python';
	import { yCollab } from 'y-codemirror.next';
	import { notebook } from '$lib/stores/notebook.svelte';
	import { room } from '$lib/stores/room.svelte';
	import CodeMirror from '$lib/components/CodeMirror.svelte';
	import type { CellData } from '$lib/types/cell';

	const { id } = $props<Omit<CellData, 'type' | 'content'>>();
	const cell = notebook.getCell(id);
	const output = $derived(notebook.outputs[id]);
	const intitialContent = cell?.content ?? '';
</script>

{#if cell}
	<div>
		<button onclick={() => notebook.executeCell(id)}>Run</button>
	</div>
	<div class="flex flex-vol w-full space-x-4">
		<div class="w-full">
			<CodeMirror
				lang={python()}
				content={intitialContent}
				extensions={[yCollab(cell.syncedContent, room.awareness)]}
			/>
		</div>
		<div class="w-full">
			{#if output}
				<div class="flex space-x-2 font-mono">
					<p>
						{output.executionState}
					</p>
					<p>
						[{output.executionIndex}]
					</p>
					<p>
						{output.excecutionDuration} ms
					</p>
				</div>
				<ul>
					{#each output.values as value}
						<li>
							{JSON.stringify(value)}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
{:else}
	<p>Cell not found</p>
{/if}
