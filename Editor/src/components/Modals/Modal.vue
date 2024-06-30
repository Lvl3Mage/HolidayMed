
<script setup>
	import { ref, computed} from 'vue'

	const props = defineProps({
		loading: {
			type: Boolean,
			required: false,
			default: false,
		},
	});


	const modalOpen = ref(true);
	
	function Close(){
		return new Promise((resolve, reject) => {
			modalOpen.value = false;
			setTimeout(() => {
				resolve();
			}, 200);
		});
	}
	defineExpose({
		Close,

	});

</script>
<template>
	<dialog class="modal" :class="{'modal-open' : modalOpen}">
		<div class="absolute z-50 inset-0 flex justify-center items-center bg-black/30 transition opacity-0 pointer-events-none" :class="{'opacity-100 pointer-events-auto': loading}">
			<slot name="loading">
				<span class="loading loading-dots loading-lg"></span>
			</slot>
		</div>
		<div class="modal-box  w-11/12 max-w-5xl">
			<slot>
				
			</slot>
		</div>
	</dialog>
</template>