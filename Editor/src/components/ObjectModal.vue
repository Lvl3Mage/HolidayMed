
<script setup>

	import {useObjectManager} from '@/stores/ObjectManager.js'	
	import {useUIManagment} from '@/stores/UIManagment.js'
	const ObjectManager = useObjectManager();
	const UIManagment = useUIManagment();

	import { ref, computed} from 'vue'
	import ApartmentTitleRenderer from "@/components/ModalRenderers/ApartmentTitleRenderer.vue"
	import ApartmentContentRenderer from "@/components/ModalRenderers/ApartmentContentRenderer.vue"
	const titleRendererLookup = {
		"apartment" : ApartmentTitleRenderer,
	};

	const contentRendererLookup = {
		"apartment" : ApartmentContentRenderer,
	};

	const props = defineProps({
		objectType: {
			type: String,
			required: true,
		}, 
		objectId: {
			type: String,
			required: true,
		},
		modalIndex: {
			type: Number,
			required: true,
		},
	});
	const loadingOverlay = ref(false);
	function SetLoadingOverlay(value){
		loadingOverlay.value = value;
	}


	const modalOpen = ref(true);
	const objectData = ref(null);

	//TODO Catch modal if type and id already open (call reject)
	ObjectManager.GetObject(props.objectType, props.objectId)
	.then(result => {
		objectData.value = result;
	})
	.catch(error => {
		console.error(error);
		UIManagment.OpenToast({appearance: "error", text: `Unable to open ${props.objectType}!`, lifetime:2000, closeOnClick: true});
		UIManagment.objectModals[props.modalIndex].reject("systemError", error);
	});

	
	function CloseModal(){
		return new Promise((resolve, reject) => {
			modalOpen.value = false;
			setTimeout(() => {
				resolve();
			}, 200);
		});
	}

	function DiscardModal(){
		CloseModal().then(() => {
			UIManagment.objectModals[props.modalIndex].resolve("canceled");
		});
	}
	function SaveModal(){
		SetLoadingOverlay(true);
		const toast = UIManagment.OpenToast({appearance:"loading",text: "Saving changes"});

		ObjectManager.WriteObject(props.objectType, props.objectId, objectData.value)
			.then(result => {
				UIManagment.OpenToast({appearance: "success", text: "Changes saved!", lifetime:2000, closeOnClick: true});
				CloseModal().then(() => {
					UIManagment.objectModals[props.modalIndex].resolve("data-saved", result);
				});
			})
			.catch(error => {
				UIManagment.OpenToast({appearance: "error", text: "Unable to save changes!", lifetime:2000, closeOnClick: true});
				console.error(error);
				//Show error poppup
			})
			.finally(() => {
				SetLoadingOverlay(false);
				toast.CloseToast();
			});

	}

	const modalContent = ref(null);
	function isValid(){
		if(!modalContent){return false;}
		if(!modalContent.value){return false;}
		return modalContent.value.isValid();
	}
</script>
<template>
	<dialog class="modal" :class="{'modal-open' : modalOpen}">
		<div class="modal-box w-11/12 max-w-5xl"  >
			<div class="absolute z-50 inset-0 flex justify-center items-center bg-black/30 transition opacity-0 pointer-events-none" :class="{'opacity-100 pointer-events-auto': loadingOverlay}">
				<span class="loading loading-dots loading-lg"></span>	
			</div>
			<div v-if="objectData">
				<h3 class="font-bold text-lg">
					<component :is="titleRendererLookup[props.objectType]" :objectData="objectData"></component> 
				</h3>
				<component :ref="(el) => modalContent = el" :is="contentRendererLookup[props.objectType]" :objectData="objectData"></component>   		
			    
				<div class="modal-action">
					<button class="btn btn-error" @click="DiscardModal()">Close</button>
					<button class="btn btn-success" :class="{'btn-disabled': !isValid()}" @click="SaveModal()">Save and close</button>
				</div>
				
			</div>
			<div v-else class="flex justify-center items-center">
				<span class="loading loading-dots loading-lg"></span>
					
			</div>
		</div>
	</dialog>
</template>
<style scoped lang="scss">
</style>