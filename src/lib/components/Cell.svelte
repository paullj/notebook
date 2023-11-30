<script lang="ts">
	type CellProps = {
		allowSideBySide?: boolean;
	};
	const { allowSideBySide = true } = $props<CellProps>();
</script>

<div
	class="rounded-sm overflow-clip bg-gray-50 border-x-4 border-b-4 focus-within:ring-2 ring-blue-400"
>
	<div class="flex flex-col md:flex-row w-full items-stretch" class:flex-col={allowSideBySide}>
		<div class="min-w-1/2">
			<div class="py-1 px-1 uppercase font-mono text-xs text-gray-500 bg-gray-200">
				<slot name="leftTitle">Left Panel</slot>
			</div>
			<div class="h-full">
				<slot name="leftPanel" />
			</div>
		</div>
		<div class="min-w-1/2">
			<div class="py-1 px-1 uppercase font-mono text-xs text-gray-500 bg-gray-200">
				<slot name="rightTitle">Right Panel</slot>
			</div>
			<div class="py-0.5 px-1">
				<slot name="rightPanel" />
			</div>
		</div>
	</div>
</div>
