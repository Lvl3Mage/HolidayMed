<script setup>
	import {useUIManagement} from "@/stores/UIManagment.js"
	const UIManagement = useUIManagement();


	import Toast from "@/components/Toasts/Toast.vue"


	import EditObjectModal from "@/components/Modals/EditObjectModal.vue";
	import CreateObjectModal from "@/components/Modals/CreateObjectModal.vue";
	import SelectImageModal from "@/components/Modals/SelectImageModal.vue";
	const modalLookup = {
		"edit-object":EditObjectModal,
		"create-object":CreateObjectModal,
		"select-image":SelectImageModal,
	}

</script>
<template>
	<!-- ToastRenderer -->
    <!-- Todo: Fix empty container blocking clicks	-->
	<div class="toast z-[1000] toast-bottom toast-end min-w-[300px]">
		<div v-for="toast in UIManagement.toasts" :key="toast.uniqueId">
			<Toast :toastData="toast"></Toast>
		</div>
	</div>
	<!-- Object Modals Renderer -->
	<div v-for="modal in UIManagement.objectModals" :key="modal.uniqueElementIndex" class="">
		<component :is="modalLookup[modal.modalType]" v-bind="modal.modalProps" :uniqueId="modal.uniqueId">
		</component>
	</div>
</template>