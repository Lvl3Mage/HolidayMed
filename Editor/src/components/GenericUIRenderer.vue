<script setup>
	import {useUIManagment} from "@/stores/UIManagment.js"
	const UIManagment = useUIManagment();


	import Toast from "@/components/Toasts/Toast.vue"


	import EditObjectModal from "@/components/EditObjectModal.vue";
	import CreateObjectModal from "@/components/CreateObjectModal.vue";
	const modalLookup = {
		"Edit":EditObjectModal,
		"Create":CreateObjectModal,
	}

</script>
<template>
	<!-- ToastRenderer -->
	<div class="toast z-[1000] toast-bottom toast-end min-w-[300px]">
		<div v-for="toast in UIManagment.toasts" :key="toast.uniqueId">
			<Toast :toastData="toast"></Toast>
		</div>
	</div>
	<!-- Object Modals Renderer -->
	<div v-for="modal in UIManagment.objectModals" :key="modal.uniqueElementIndex" class="">
		<component :is="modalLookup[modal.modalType]" v-bind="modal.modalProps" :uniqueId="modal.uniqueId">
		</component>
	</div>
</template>