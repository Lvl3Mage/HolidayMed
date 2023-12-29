<script >
	import {useObjectManager} from '@/stores/ObjectManager.js'	
	import {useUIState} from '@/stores/UIState.js'

	export default{
		props: {
			objectType: {
				type: String,
				required: true,
			}, 
			objectId: {
				type: String,
				required: true,
			},
		},
		emits: ["modal-closed"],
		data() {

			return {
				modalOpen: true,
			}
		},
		setup(){
			const ObjectManager = useObjectManager();
			const UIState = useUIState();
			return {ObjectManager, UIState};
		},
		created(){
			if(!this.ObjectManager.ObjectOpen(this.objectType,this.objectId)){
				this.ObjectManager.OpenObject(this.objectType, this.objectId);
			}
		},
		mounted(){
		},
		watch:{
			// modelValue:function(val){
			// 	this.selectedDate = val;
			// },
		},
		methods: {
			async CloseModalAsync(){
				this.modalOpen = false;
				await sleep(100);
				this.UnloadModal();
			},
			UnloadModal(){
				if(this.UIState.OpenObjectModalCount(this.objectType, this.objectId) == 1){
					//last open modal for object
					this.ObjectManager.CloseObject(this.objectType, this.objectId);
				}
				this.$emit("modal-closed");

			}

		},
		computed: {
			selfObject: function(){
				return this.ObjectManager.ReadObject(this.objectType, this.objectId);
			},
			objectLoaded: function(){
				return this.ObjectManager.ObjectLoaded(this.objectType, this.objectId);
			}
		}
	}

	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
</script>

<template>
	<dialog class="modal" :class="{'modal-open' : modalOpen}">
		<div class="modal-box w-11/12 max-w-5xl">
			<div v-if="objectLoaded">
				<h3 class="font-bold text-lg">
					<slot name="title-renderer">Modal Title</slot>
				</h3>
				<slot name="content-renderer">Modal content</slot>    		
			    
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