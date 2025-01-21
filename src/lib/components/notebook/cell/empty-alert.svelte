<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import type { InsertCellFn } from '$lib/state/notebook.svelte';

	const { onInsert }: { onInsert: InsertCellFn } = $props();
</script>

<Alert.Root>
	<Alert.Description class="flex flex-row items-center space-x-2 text-sm font-light	">
		<p>This notebook is empty, add a</p>
		<Button size="xs" variant="outline" onclick={() => onInsert({ type: 'code' })}>
			<p class="text-xs">Python</p>
		</Button>
		<p>or</p>
		<Button size="xs" variant="outline" onclick={() => onInsert({ type: 'markdown' })}>
			<p class="text-xs">Markdown</p>
		</Button>
		<p>cell</p>
	</Alert.Description>
</Alert.Root>
