<script lang="ts">
	import { marked } from 'marked';
	import { markdown } from '@codemirror/lang-markdown';
	import { yCollab } from 'y-codemirror.next';
	import { notebook } from '$lib/stores/notebook.svelte';
	import { room } from '$lib/stores/room.svelte';
	import CodeMirror from '$lib/components/CodeMirror.svelte';
	import type { CellData } from '$lib/types/cell';

	const { id, content } = $props<Omit<CellData, 'type'>>();

	const cell = notebook.getCell(id);
	const intitialContent = cell?.content ?? '';

	// TODO: Sanitize HTML before rendering
	// TODO: Look into SSR
</script>

{#if cell}
	<div class="flex w-full space-x-4 items-start">
		<div class="w-1/2 h-full">
			<CodeMirror
				lang={markdown()}
				content={intitialContent}
				extensions={[yCollab(cell.syncedContent, room.awareness)]}
			/>
		</div>
		<div class="w-1/2 text-sm prose">
			{#if content || content?.trim() === ''}
				{@html marked.parse(content)}
			{:else}
				<p>Empty cell</p>
			{/if}
		</div>
	</div>
{:else}
	<p>Cell not found</p>
{/if}
