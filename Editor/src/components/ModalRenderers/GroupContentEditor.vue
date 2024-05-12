<script setup>

	import {ref, computed, shallowReactive, watch, reactive} from "vue";
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
	const objectData = reactive(props.objectData);
	//Preparing Title for REST POST request
	props.objectData.title = props.objectData.title.rendered;
	watch(objectData, (newData) => {
		const title = newData.acf.title;
		const building = ObjectCache.GetObject('building', newData.acf.edificio);
		objectData.title = `${building.acf.title} &#8212; ${title}`;
	});
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
	function GetChildApartments(){
		return ObjectCache.GetSegmentRows('apartment').filter(apartment => apartment.acf.group == props.objectData.id);
	}

	function ViewObj(objectType, objectId){
		UIManagment.OpenEditObjectModal(objectType, objectId).then((result) => {
			console.log(result.code, result.data);
		}).catch((error) => {
			console.error(error.code, error.data);
		});
	}


	function CreateApartment(){
		UIManagment.OpenCreateObjectModal('apartment', {
			'dataHandler': (data) => {
				data.acf.group = props.objectData.id;
			}
		
		}).then((result) => {
			console.log(result.code, result.data);
		}).catch((error) => {
			console.error(error.code, error.data);
		});
	}
	
	function GetTitle(){
		return props.objectData.title;
	}
	defineExpose({
		isValid,
		GetTitle
	});
</script>
<template>
		<div role="tablist" class="tabs tabs-lifted">
		<input type="radio" name="groupTabs" role="tab" class="tab" aria-label="Info" checked />
		<div role="tabpanel" class="tab-content">
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
				<TextInput :ref="el => validatableInputs['titleInput'] = el" v-model="getAcf().title" placeholder="Enter group title" :validate="formValueValidation.notEmpty" type='text'>
				</TextInput>
				<template v-slot:invalid>Cannot be empty</template>
			</InputLabel>
		</div>

		<input type="radio" name="groupTabs" role="tab" class="tab" aria-label="Apartments" />
		<div role="tabpanel" class="tab-content">
			<div class="divider">Group Apartments</div>
			<CacheSegmentRenderer type="apartment" class="min-h-44">
				<TableDataDisplay :rows="GetChildApartments()" :compact="true" :showRowNumbers="false" :rowsPerPage="10" :fields="[
					{
						displayName: 'Apartment',
						render: (object) => object.title.rendered,
						getSortValue: (object) => object.title.rendered,
						getSearchValue: (object) => object.title.rendered,
					},
				]"
				:actions="[
					{
						render: (object) => `<button class='btn btn-info btn-xs'>Edit</button>`,
						onClick: (object) => ViewObj('apartment', object.id),
					},
				]"/>
			</CacheSegmentRenderer>

			<div class="flex justify-center items-center gap-3 mt-4">
				<div class="btn btn-success" @click="CreateApartment()">Create new apartment</div>
			</div>
		</div>
	</div>


</template>
<style scoped lang="scss">
</style>