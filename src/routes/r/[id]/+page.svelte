<script lang="ts">
	import Notebook from '$lib/components/Notebook.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

{JSON.stringify(data)}
<Notebook />
