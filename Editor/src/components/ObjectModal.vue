
<script setup>

	import {useObjectManager} from '@/stores/ObjectManager.js'	
	import {useUIState} from '@/stores/UIState.js'
	const ObjectManager = useObjectManager();
	const UIState = useUIState();


	import { ref, computed, onMounted } from 'vue'
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
	});
	const emit = defineEmits(['modal-closed']);
	onMounted(()=>{
		if(!ObjectManager.ObjectOpen(props.objectType,props.objectId)){
			ObjectManager.OpenObject(props.objectType, props.objectId);
		}
	});
	const selfObject = computed(() => {
		return ObjectManager.ReadObject(props.objectType, props.objectId);
	});
	const objectLoaded = computed(() =>{
		return ObjectManager.ObjectLoaded(props.objectType, props.objectId);
	});

	const modalOpen = ref(true);

	function sleep(ms) {
	    return new Promise(resolve => setTimeout(resolve, ms));
	}
	async function CloseModalAsync(){
		modalOpen.value = false;
		await sleep(100);
		UnloadModal();
	};
	function UnloadModal(){
		if(UIState.OpenObjectModalCount(props.objectType, props.objectId) == 1){
			//last open modal for object
			ObjectManager.CloseObject(props.objectType, props.objectId);
		}
		emit("modal-closed");
	};
</script>
<template>
	<dialog class="modal" :class="{'modal-open' : modalOpen}">
		<div class="modal-box w-11/12 max-w-5xl">
			<div v-if="objectLoaded">
				<h3 class="font-bold text-lg">
					<component :is="titleRendererLookup[props.objectType]" :objectType="props.objectType" :objectId="props.objectId"></component> 
				</h3>
				<component :is="contentRendererLookup[props.objectType]" :objectType="props.objectType" :objectId="props.objectId"></component>   		
			    
				<div class="modal-action">
					<button class="btn btn-error" @click="CloseModalAsync()">Close</button>
					<button class="btn btn-success">Save and close</button>
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