<script lang="ts">
	import { marked } from 'marked';
	import { markdown } from '@codemirror/lang-markdown';
	import { yCollab } from 'y-codemirror.next';
	import { notebook } from '$lib/stores/notebook.svelte';
	import { room } from '$lib/stores/room.svelte';
	import CodeMirror from '$lib/components/CodeMirror.svelte';
	import type { CellData } from '$lib/types/cell';
	import Cell from './Cell.svelte';

	const { id, content } = $props<Omit<CellData, 'type'>>();

	const cell = notebook.getCell(id);
	const intitialContent = cell?.content ?? '';

	// TODO: Sanitize HTML before rendering
	// TODO: Look into SSR
</script>

{#if cell}
	<Cell>
		<span slot="leftTitle">Markdown</span>
		<span slot="rightTitle">Preview</span>
		<span slot="leftPanel">
			<CodeMirror
				lang={markdown()}
				content={intitialContent}
				extensions={[yCollab(cell.syncedContent, room.awareness)]}
			/>
		</span>
		<div slot="rightPanel" class="px-2 py-1">
			{#if content && content.trim() !== ''}
				<div class="text-sm prose">
					{@html marked.parse(content)}
				</div>
			{:else}
				<p class="text-gray-300 font-mono text-xs">Empty cell</p>
			{/if}
		</div>
	</Cell>
{:else}
	<p>Cell not found</p>
{/if}
