<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import ModeToggle from '$lib/components/mode-toggle.svelte';

	let { children } = $props();
</script>

<ModeWatcher />
<ModeToggle />
{@render children()}
