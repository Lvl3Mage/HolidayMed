<script setup>
	import ObjectModal from "@/components/ObjectModal.vue"
	import {useUIState} from "@/stores/UIState.js"
	const UIState = useUIState();
	

</script>
<template>
	<div class="">
	</div>
	<div v-for="(modal,index) in UIState.objectModals" :key="modal.objectId" class="">
		<ObjectModal :objectType="modal.objectType" :objectId="modal.objectId" @modal-closed="UIState.CloseObjectModal(index)">
		</ObjectModal>
	</div>
</template>
<style scoped lang="scss">
</style>