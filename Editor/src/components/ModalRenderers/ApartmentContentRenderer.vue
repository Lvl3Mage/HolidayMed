<script setup>
	import {useObjectManager} from '@/stores/ObjectManager.js'	
	const ObjectManager = useObjectManager();

	import {ref, computed} from "vue";
	import TextInput from "@/components/FormElements/TextInput.vue"

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
	function ReadObject(){
		return ObjectManager.ReadObject(props.objectType, props.objectId);
	};
	function getData(){
		return ReadObject().data;
	};
	function getAcf(){
		return ReadObject().data.acf;
	};
	const invalidInputs = ref({
		"aprtIdentifier": false,
	});

	function validateEmpty(inputName, value){
		invalidInputs.value[inputName] = value == '';
	}
</script>
<template>
	<TextInput v-model="getAcf().inner_id" placeholder="Enter apartment identifier" :invalid="invalidInputs['aprtIdentifier']" @change="validateEmpty('aprtIdentifier', getAcf().inner_id)">
		<template v-slot:label>Apartment identifier</template>
	</TextInput>
</template>
<style scoped lang="scss">
</style>