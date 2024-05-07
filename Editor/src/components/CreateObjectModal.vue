
<script setup>

	import {useObjectManager} from '@/stores/ObjectManager.js'	
	import {useUIManagment} from '@/stores/UIManagment.js'
	const ObjectManager = useObjectManager();
	const UIManagment = useUIManagment();

	import { ref, computed} from 'vue'

	import getDataDefaults from "@/DataDefaults.js";

	import ApartmentContentCreator from "@/components/ModalRenderers/ApartmentContentCreator.vue"
	const titleLookup = {
		"apartment" : data => "Create new apartment",
		"group" : data => "Create new group",
	};

	const contentRendererLookup = {
		"apartment" : ApartmentContentCreator,
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
	});
	const loadingOverlay = ref(false);
	function SetLoadingOverlay(value){
		loadingOverlay.value = value;
	}


	const modalOpen = ref(true);
	const objectData = ref(getDataDefaults(props.objectType));
	const creationParams = UIManagment.GetModalByUniqueId(props.uniqueId).creationParams;
	if(creationParams.dataHandler){
		creationParams.dataHandler(objectData.value);
	}


	//TODO Catch modal if type and id already open (call reject)
	
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
			UIManagment.GetModalByUniqueId(props.uniqueId).resolve("canceled");
		});
	}
	function SaveModal(){
		if(!isValid()){return;}
		SetLoadingOverlay(true);
		const toast = UIManagment.OpenToast({appearance:"loading",text: `Creating ${props.objectType}`});

		ObjectManager.CreateObject(props.objectType, objectData.value)
			.then(result => {
				UIManagment.OpenToast({appearance: "success", text: "Changes succesfully!", lifetime:2000, closeOnClick: true});
				CloseModal().then(() => {
					UIManagment.GetModalByUniqueId(props.uniqueId).resolve("data-saved", result);
				});
			})
			.catch(error => {
				UIManagment.OpenToast({appearance: "error", text: "Unable to save changes!", lifetime:2000, closeOnClick: true});
				console.error(error);
			})
			.finally(() => {
				SetLoadingOverlay(false);
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
	<dialog class="modal" :class="{'modal-open' : modalOpen}">
		<div class="modal-box w-11/12 max-w-5xl"  >
			<div class="absolute z-50 inset-0 flex justify-center items-center bg-black/30 transition opacity-0 pointer-events-none" :class="{'opacity-100 pointer-events-auto': loadingOverlay}">
				<span class="loading loading-dots loading-lg"></span>	
			</div>
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
		</div>
	</dialog>
</template>
<style scoped lang="scss">
</style>