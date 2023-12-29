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
		data() {

			return {
			}
		},
		setup(){
			const ObjectManager = useObjectManager();
			return {ObjectManager};
		},
		created(){
		},
		mounted(){
		},
		watch:{
			// modelValue:function(val){
			// 	this.selectedDate = val;
			// },
		},
		methods: {

		},
		computed: {
			selfObject: function(){
				return this.ObjectManager.ReadObject(this.objectType, this.objectId);
			},
		}
	}

</script>
<template>
	<label class="form-control w-full max-w-xs">
	  <div class="label">
	    <span class="label-text">Apartment identifier</span>
	  </div>
	  <input v-model="selfObject.data.acf.inner_id" type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs" />
	</label>
	
	<label class="form-control w-full max-w-xs">
	  <div class="label">
	    <span class="label-text">Apartment identifier</span>
	  </div>
	  <input v-model="selfObject.data.acf.inner_id" type="text" placeholder="Type here" class="input input-bordered w-full max-w-xs" />
	</label>
</template>
<style scoped lang="scss">
</style>