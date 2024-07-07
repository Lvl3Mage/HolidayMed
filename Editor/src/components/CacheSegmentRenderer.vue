<script setup>
	import { ref, computed } from 'vue';

	import {useObjectCache} from '@/stores/ObjectCache'
	const ObjectCache = useObjectCache();
	const props = defineProps({
		type: {
			type: String,
			required: false,		
		},
		types: {
			type: Array,
			required: false,
			default: [],
		},
		renderWhenLoading: {
			type: Boolean,
			required: false,
			default: true,
		}
	});
	function isLoading(){
		let loading = false;
		if(props.type){
			loading ||= ObjectCache.SegmentLoading(props.type);
		}
		if(props.types.length > 0){
			loading ||= props.types.some(type => ObjectCache.SegmentLoading(type));
		}
		return loading;
	}
</script>
<template>
	<div class="relative">
<!--		shadow-[inset_0_0_10px+20px] shadow-base-100 -->
		<div class="absolute z-50 inset-0 flex justify-center items-center opacity-0 bg-black/30 transition duration-300 pointer-events-none" :class="{'opacity-100 pointer-events-auto': isLoading()}">
			<span class="loading loading-dots loading-lg"></span>	
		</div>
		<slot v-if="renderWhenLoading || !isLoading()">
		</slot>
		<!-- <div class="flex justify-center items-center h-full" v-else>
			<h2 class="p-4">Loading</h2>
		</div> -->
	</div>
</template>
<style lang="scss">

</style>