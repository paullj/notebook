<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { Cell } from '$schema/zero';
	import type { Row } from '@rocicorp/zero';

	type UpdateCellFn = (id: string, content: string) => void;
	const { onUpdate, cell }: { onUpdate: UpdateCellFn; cell: Row<Cell> } = $props();
</script>

<Card.Root>
	<Card.Content>
		<Textarea
			class="w-full font-mono"
			value={cell.content}
			oninput={(e) => onUpdate(cell.id, e.currentTarget.value)}
		></Textarea>
	</Card.Content>
</Card.Root>
