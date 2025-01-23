<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { EllipsisVertical, Play } from 'lucide-svelte';
	import type { Cell } from '$schema/zero';
	import type { Row } from '@rocicorp/zero';
	import { python } from '@codemirror/lang-python';
	import Editor from '$lib/components/editor/editor.svelte';

	type UpdateCellFn = (id: string, content: string) => void;
	const { onUpdate, cell }: { onUpdate: UpdateCellFn; cell: Row<Cell> } = $props();
</script>

<Card.Root>
	{#if cell.type === 'code'}
		<Card.Aside size="sm" side="left" class="flex flex-col items-end">
			<Button class="h-6 w-6 rounded-sm p-0 text-green-500" variant="ghost">
				<Play class="text-green-500" />
			</Button>
		</Card.Aside>
	{/if}
	<Card.Content class="p-0">
		<Editor lang={python()} content={cell.content ?? ''} onInput={(v) => onUpdate(cell.id, v)} />
	</Card.Content>
</Card.Root>
