<script lang="ts">
	import { basicSetup } from 'codemirror';
	import { EditorView } from '@codemirror/view';
	import { EditorState, type Extension } from '@codemirror/state';
	import { browser } from '$app/environment';
	import type { LanguageSupport } from '@codemirror/language';
	import { untrack } from 'svelte';

	type Props = {
		content?: string | null;
		lang: LanguageSupport;
		extensions?: Extension[];
		onInput?: (value: string) => void;
	};

	let { lang, content, extensions = [], onInput }: Props = $props();

	let view: EditorView | undefined;
	let editorState: EditorState | undefined;
	let parent: HTMLDivElement | undefined = $state(undefined);

	const theme = EditorView.theme({
		'&.cm-focused': {
			outline: 'none'
		},
		'.cm-content': {
			minHeight: '6rem'
		},
		'.cm-gutters': {
			height: '6rem'
		},
		'.cm-scroller': {
			overflow: 'auto'
		}
	});

	$effect(() => {
		if (!parent) return;

		editorState = EditorState.create({
			doc: untrack(() => content) ?? '',
			selection: { anchor: 0, head: 0 },
			extensions: [
				basicSetup,
				lang,
				theme,
				EditorView.updateListener.of(function (e) {
					if (e.docChanged) {
						onInput?.(e.state.doc.toString());
					}
				}),
				...extensions
			]
		});

		view = new EditorView({
			state: editorState,
			parent
		});

		return () => {
			view?.destroy();
		};
	});
</script>

{#if browser}
	<div class="h-full" bind:this={parent}>
		<!--  -->
	</div>
{/if}
