<script setup>

	import {ref, computed, shallowReactive, watch} from "vue";
	import {formValueValidation} from "@/Utils.js";
	import TextInput from "@/components/FormElements/TextInput.vue"
	import InputLabel from "@/components/FormElements/InputLabel.vue"
	import SelectInput from '@/components/FormElements/SelectInput.vue';
	import TableDataDisplay from '@/components/TableDataDisplay.vue';
	import CacheSegmentRenderer from '@/components/CacheSegmentRenderer.vue';



	import {useObjectCache} from '@/stores/ObjectCache'
	import {useUIManagment} from '@/stores/UIManagment.js'

	const ObjectCache = useObjectCache();
	const UIManagment = useUIManagment();


	const props = defineProps({
		objectData: {
			type: Object,
			required: true,
		},
	});

	//Preparing Title for REST POST request since the title field needs to be a string but is an object //TODO this is kinda weird and maybe should be handled more globaly
	props.objectData.title = props.objectData.title.rendered;
	function getAcf(){
		return props.objectData.acf;
	};

	const validatableInputs = shallowReactive({});
	watch(validatableInputs, (newVal) => {
			for(let key of Object.keys(newVal)){
				if(newVal[key] === null){
					delete newVal[key];
				}
			}
		},
		{ flush: 'sync' }
	);


	function isValid(){
		return Object.keys(validatableInputs).every(inputKey => validatableInputs[inputKey].valid);
	}
	function GetValidBuildings(){
		return ObjectCache.GetSegmentData('building');
	}

	function ViewObj(objectType, objectId){
		UIManagment.OpenEditObjectModal(objectType, objectId).then((result) => {
			console.log(result.code, result.data);
		}).catch((error) => {
			console.error(error.code, error.data);
		});
	}
	defineExpose({
		isValid,
		GetTitle: () => "Creating Group",
	});
</script>
<template>
	<div class="w-fit">
		<InputLabel>
			<template v-slot:label>Group Building</template>
			<div class="join">
				<SelectInput class="join-item" v-model="getAcf().edificio" :allowEmpty="false" :options="GetValidBuildings()" :render="building=>building.title.rendered" :getSearchValue="building=>building.title.rendered" :buttonClasses="['join-item']"></SelectInput>
				<div class="btn btn-info join-item" @click="ViewObj('building', getAcf().edificio)">Edit</div>
			</div>
		</InputLabel>
	</div>
	<InputLabel :validatedInput="validatableInputs['titleInput']">
		<template v-slot:label>Group Title</template>
		<TextInput :ref="el => validatableInputs['titleInput'] = el" v-model="objectData.title" placeholder="Enter group title" :validate="formValueValidation.notEmpty" type='text'>
		</TextInput>
		<template v-slot:invalid>Cannot be empty</template>
	</InputLabel>


</template>
<style scoped lang="scss">
</style>