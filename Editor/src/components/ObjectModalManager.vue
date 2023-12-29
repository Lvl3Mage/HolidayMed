<script setup>
	import ObjectModal from "@/components/ObjectModal.vue"
	import ApartmentTitleRenderer from "@/components/ModalRenderers/ApartmentTitleRenderer.vue"
	import ApartmentContentRenderer from "@/components/ModalRenderers/ApartmentContentRenderer.vue"
	import {useUIState} from "@/stores/UIState.js"
	const UIState = useUIState();
	const titleRendererLookup = {
		"apartment" : ApartmentTitleRenderer,
	};

	const contentRendererLookup = {
		"apartment" : ApartmentContentRenderer,
	};

</script>
<template>
	<div class="">
	</div>
	<div v-for="(modal,index) in UIState.objectModals" :key="modal.objectId" class="">
		<ObjectModal :objectType="modal.objectType" :objectId="modal.objectId" @modal-closed="UIState.CloseObjectModal(index)">
			<template v-slot:title-renderer>
				<component :is="titleRendererLookup[modal.objectType]" :objectType="modal.objectType" :objectId="modal.objectId"></component>
			</template>
			<template v-slot:content-renderer>
				<component :is="contentRendererLookup[modal.objectType]" :objectType="modal.objectType" :objectId="modal.objectId"></component>
			</template>
		</ObjectModal>
	</div>
</template>
<style scoped lang="scss">
</style>