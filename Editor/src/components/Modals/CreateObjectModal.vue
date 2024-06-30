
<script setup>

	import {useObjectManager} from '@/stores/ObjectManager.js'	
	import {useUIManagement} from '@/stores/UIManagment.js'
	const ObjectManager = useObjectManager();
	const UIManagement = useUIManagement();

	import { ref, computed} from 'vue'

	import getDataDefaults from "@/DataDefaults.js";

	import ApartmentContentCreator from "@/components/Modals/ModalRenderers/ApartmentContentCreator.vue"
	import BuildingContentCreator from "@/components/Modals/ModalRenderers/BuildingContentCreator.vue"
	import Modal from "@/components/Modals/Modal.vue";

	const contentRendererLookup = {
		"apartment" : ApartmentContentCreator,
		"building" : BuildingContentCreator,
	};

	const props = defineProps({
		objectType: {
			type: String,
			required: true,
		},
		uniqueId: {
			type: Number,
			required: true,
		},
		dataHandler: {
			type: Function,
			required: false,
			default: () => {},
		},
	});
	
	const modal = ref(null);
	const loadingOverlay = ref(false);
	const objectData = ref(getDataDefaults(props.objectType));
	if (props.dataHandler){
		props.dataHandler(objectData.value);
	}


	//TODO Catch modal if type and id already open (call reject)
	
	function DiscardModal(){
		modal.value.Close().then(() => {
			UIManagement.GetModalByUniqueId(props.uniqueId).resolve("canceled");
		});
	}
	function SaveModal(){
		if(!isValid()){return;}
		loadingOverlay.value = true;
		const toast = UIManagement.OpenToast({appearance:"loading",text: `Creating ${props.objectType}`});

		ObjectManager.CreateObject(props.objectType, objectData.value)
			.then(result => {
				UIManagement.OpenToast({appearance: "success", text: "Changed successfully!", lifetime:2000, closeOnClick: true});
				modal.value.Close().then(() => {
					UIManagement.GetModalByUniqueId(props.uniqueId).resolve("data-saved", result);
				});
			})
			.catch(error => {
				UIManagement.OpenToast({appearance: "error", text: "Unable to save changes!", lifetime:2000, closeOnClick: true});
				console.error(error);
			})
			.finally(() => {
				loadingOverlay.value = false;
				toast.CloseToast();
			});

	}
	function GetTitle(){
		if(modalContent.value){
			return modalContent.value.GetTitle();
		}
		return '';
	}

	const modalContent = ref(null);
	function isValid(){
		if(!modalContent){return false;}
		if(!modalContent.value){return false;}
		return modalContent.value.isValid();
	}
</script>
<template>
	
	<Modal :loading="loadingOverlay" ref="modal">
		<div v-if="objectData">
			<h3 class="font-bold text-lg" v-html="GetTitle()">
			</h3>
			<component :ref="(el) => modalContent = el" :is="contentRendererLookup[props.objectType]" :objectData="objectData"></component>   		
		    
			<div class="modal-action">
				<button class="btn btn-error" @click="DiscardModal()">Close</button>
				<button class="btn btn-success" :class="{'btn-disabled': !isValid()}" @click="SaveModal()">Create and close</button>
			</div>
			
		</div>
		<div v-else class="flex justify-center items-center">
			<span class="loading loading-dots loading-lg"></span>
				
		</div>
	</Modal>
</template>