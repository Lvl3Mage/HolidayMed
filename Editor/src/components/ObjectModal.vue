
<script setup>

	import {useObjectManager} from '@/stores/ObjectManager.js'	
	import {useUIState} from '@/stores/UIState.js'
	const ObjectManager = useObjectManager();
	const UIState = useUIState();

	import { ref, computed, onMounted, nextTick } from 'vue'
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
	const modalOpen = ref(true);//TODO figure out the animations for modals up and down and make the close and save async functions run the reject and resolve when the animations are done
	const objectData = ref(null);
	//TODO
	// if modal already open
		//UIState.objectModals[props.modalIndex].reject("userError", {message:"Modal already open"});
	// else continue
	ObjectManager.GetObject(props.objectType, props.objectId).then(result => {
		objectData.value = result;
	}).catch(error => {
		console.error(error);

		//TODO show error poppup when catching error later
		UIState.objectModals[props.modalIndex].reject("systemError", error);
	})

	function DiscardModal(){
		UIState.objectModals[props.modalIndex].resolve("canceled");
	}
	function SaveModal(){
		ObjectManager.WriteObject(props.objectType, props.objectId, objectData.value).then(result => {
			modalOpen.value = false;
			setTimeout(() => {
				UIState.objectModals[props.modalIndex].resolve("saved", result);
			}, 200);
		}).catch(error => {
			console.error(error);
			//Show error poppup
		})

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