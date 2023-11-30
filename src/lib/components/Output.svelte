<script lang="ts">
	import type { OutputValue } from '$lib/types/output';

	const { type, format, value } = $props<OutputValue<unknown>>();
</script>

{@const displayText =
	format === 'string' && value instanceof String && value.length === 0 ? '\n' : value}
{#if type === 'drawDOMCanvas'}
	<!-- type drawDOMCanvas -->
	<div class="">
		<!-- <canvas bind:this={canvasElement} /> -->
	</div>
{:else if type === 'returnValue'}
	<pre class="break-words whitespace-pre-wrap font-mono text-gray-900">{displayText}</pre>
{:else if type === 'stdout'}
	<!-- type stdout -->
	<pre class="break-words whitespace-pre-wrap font-mono text-gray-900">{displayText}</pre>
{:else}
	<!-- type stderr and python error -->
	<pre class="break-words whitespace-pre-wrap font-mono text-red-500">{displayText}</pre>
{/if}
