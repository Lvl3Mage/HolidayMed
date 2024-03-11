
<script setup>

	import {useObjectManager} from '@/stores/ObjectManager.js'	
	import {useUIManagment} from '@/stores/UIManagment.js'
	const ObjectManager = useObjectManager();
	const UIManagment = useUIManagment();

	import { ref, computed} from 'vue'
	import ApartmentContentEditor from "@/components/ModalRenderers/ApartmentContentEditor.vue"
	const titleLookup = {
		"apartment" : data => data.title.rendered,
	};

	const contentRendererLookup = {
		"apartment" : ApartmentContentEditor,
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
	const objectData = ref(null);

	//TODO Catch modal if type and id already open (call reject)

	const requestToast = UIManagment.OpenToast({appearance:"loading",text: `Loading ${props.objectType}!`});
	ObjectManager.GetObject(props.objectType, props.objectId)
	.then(result => {
		objectData.value = result;
	})
	.catch(error => {
		console.error(error);
		UIManagment.OpenToast({appearance: "error", text: `Unable to open ${props.objectType}!`, lifetime:2000, closeOnClick: true});
		UIManagment.GetModalByUniqueId(props.uniqueId).reject("systemError", error);
	})
	.finally(() => {
		requestToast.CloseToast();
	})

	
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
		SetLoadingOverlay(true);
		const toast = UIManagment.OpenToast({appearance:"loading",text: "Saving changes"});

		ObjectManager.WriteObject(props.objectType, props.objectId, objectData.value)
			.then(result => {
				UIManagment.OpenToast({appearance: "success", text: "Changes saved!", lifetime:2000, closeOnClick: true});
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
					{{titleLookup[props.objectType](objectData)}}
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