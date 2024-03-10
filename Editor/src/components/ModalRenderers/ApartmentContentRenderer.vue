<script setup>

	import {ref, computed} from "vue";
	import TextInput from "@/components/FormElements/TextInput.vue"
	import InputLabel from "@/components/FormElements/InputLabel.vue"

	const props = defineProps({
		objectData: {
			type: Object,
			required: true,
		},
	});
	function getAcf(){
		return props.objectData.acf;
	};


	const validation = {
		"notEmpty": function(value){
			return value != ""
		},
	}

	const validatableInputs = ref({});


	function isValid(){
		return Object.keys(validatableInputs.value).every(inputKey => validatableInputs.value[inputKey].valid);
	}

	defineExpose({
		isValid,
	});
</script>
<template>
	<InputLabel :validatedInput="validatableInputs['testInput']">
		<template v-slot:label>Apartment identifier</template>
		<TextInput :ref="el => validatableInputs['testInput'] = el" v-model="getAcf().inner_id" placeholder="Enter apartment identifier" :validate="validation.notEmpty">
		</TextInput>
		<template v-slot:invalid>Cannot be empty</template>
	</InputLabel>
</template>
<style scoped lang="scss">
</style>