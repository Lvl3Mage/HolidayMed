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
	const validation = {
		"notEmpty": function(value){
			return value != ""
		},
	}
	function validateEmpty(value){
		return value == '';
	}

	const validatableInputs = ref([]);
	function isValid(){
		return validatableInputs.value.every(input => input.isValid());
	}
	defineExpose({
		isValid,
	});
</script>
<template>
	<TextInput :ref="el => validatableInputs.push(el)" v-model="getAcf().inner_id" placeholder="Enter apartment identifier" :validate="validation.notEmpty">
		<template v-slot:label>Apartment identifier</template>
	</TextInput>
</template>
<style scoped lang="scss">
</style>