<script lang="ts">
	import { CircleOff, Circle } from 'lucide-svelte/icons';

	import { toggleMode, mode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<Button
	onclick={toggleMode}
	tooltip={$mode === 'dark' ? 'Light mode' : 'Dark mode'}
	variant="ghost"
	size="icon"
	class="inset-r inset-top absolute right-1 top-1"
>
	<Circle
		class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
	/>
	<CircleOff
		class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
	/>
	<span class="sr-only">Toggle theme</span>
</Button>
