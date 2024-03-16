<script setup>
	import { ref, computed } from 'vue';

	import {useObjectCache} from '@/stores/ObjectCache'
	const ObjectCache = useObjectCache();
	const props = defineProps({
		type: {
			type: String,
			required: true,
		},
		renderWhenLoading: {
			type: Boolean,
			required: false,
			default: true,
		}
	});
	
</script>
<template>
	<div class="relative">
		<div class="absolute z-50 inset-0 flex justify-center items-center bg-black/30 transition opacity-0 pointer-events-none" :class="{'opacity-100 pointer-events-auto': ObjectCache.SegmentLoading(type)}">
			<span class="loading loading-dots loading-lg"></span>	
		</div>
		<slot v-if="renderWhenLoading || !ObjectCache.SegmentLoading(type)">
		</slot>
		<!-- <div class="flex justify-center items-center h-full" v-else>
			<h2 class="p-4">Loading</h2>
		</div> -->
	</div>
</template>