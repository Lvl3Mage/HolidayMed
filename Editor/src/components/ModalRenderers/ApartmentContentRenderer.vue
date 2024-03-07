<script setup>

	import {ref, computed} from "vue";
	import TextInput from "@/components/FormElements/TextInput.vue"

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