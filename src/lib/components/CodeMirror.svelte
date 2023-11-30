<script lang="ts">
	import { basicSetup } from 'codemirror';
	import { EditorView, ViewPlugin } from '@codemirror/view';
	import { defaultKeymap, historyField, indentWithTab } from '@codemirror/commands';
	import { EditorState, StateEffect, type Extension } from '@codemirror/state';
	import { browser } from '$app/environment';
	import type { LanguageSupport } from '@codemirror/language';

	type Props = {
		lang: LanguageSupport;
		content?: string;
		extensions?: Extension[];
	};

	let { lang, content, extensions = [] } = $props<Props>();

	let editorView: EditorView | undefined;
	let editorState: EditorState | undefined;
	let parent: HTMLDivElement | undefined;

	const theme = EditorView.theme({
		'&.cm-focused': {
			outline: 'none'
		}
	});

	$effect(() => {
		if (!parent) return;

		editorState = EditorState.create({
			doc: content ?? '',
			selection: { anchor: 0, head: 0 },
			extensions: [basicSetup, lang, theme, ...extensions]
		});

		editorView = new EditorView({
			state: editorState,
			parent
		});

		return () => {
			editorView?.destroy();
		};
	});
</script>

{#if browser}
	<div class="contents h-full" bind:this={parent} />
{/if}
