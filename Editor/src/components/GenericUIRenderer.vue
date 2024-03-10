<script setup>
	import {useUIManagment} from "@/stores/UIManagment.js"
	const UIManagment = useUIManagment();


	import Toast from "@/components/Toasts/Toast.vue"


	import ObjectModal from "@/components/ObjectModal.vue"


</script>
<template>
	<!-- ToastRenderer -->
	<div class="toast z-[1000] toast-bottom toast-end min-w-[300px]">
		<div v-for="toast in UIManagment.toasts" :key="toast.uniqueId">
			<Toast :toastData="toast"></Toast>
		</div>
	</div>
	<!-- Object Modals Renderer -->
	<div v-for="(modal,index) in UIManagment.objectModals" :key="modal.uniqueElementIndex" class="">
		<ObjectModal :objectType="modal.objectType" :objectId="modal.objectId" :modalIndex="index">
		</ObjectModal>
	</div>
</template>