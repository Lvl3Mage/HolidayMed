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
		}
	}

</script>
<template>
	{{ObjectManager.GetObject(objectType, objectId).data.acf.inner_id}}
</template>
<style scoped lang="scss">
</style>