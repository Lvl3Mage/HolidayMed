<script setup>

	import {ref, computed} from "vue";
	import TextInput from "@/components/FormElements/TextInput.vue"
	import InputLabel from "@/components/FormElements/InputLabel.vue"
	import SelectInput from '@/components/FormElements/SelectInput.vue';



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
	defineExpose({
		isValid,
	});
</script>
<template>
	<InputLabel :validatedInput="validatableInputs['innerIdInput']">
		<template v-slot:label>Apartment identifier</template>
		<TextInput :ref="el => validatableInputs['innerIdInput'] = el" v-model="getAcf().inner_id" placeholder="Enter apartment identifier" :validate="validation.notEmpty">
		</TextInput>
		<template v-slot:invalid>Cannot be empty</template>
	</InputLabel>
	<InputLabel :validatedInput="validatableInputs['floorInput']">
		<template v-slot:label>Apartment Floor</template>
		<TextInput :ref="el => validatableInputs['floorInput'] = el" v-model="getAcf().floor" placeholder="Enter apartment identifier" :validate="validation.notEmpty" type='number'>
		</TextInput>
		<template v-slot:invalid>Cannot be empty</template>
	</InputLabel>
	<div class="w-fit flex gap-5 items-end">
		<InputLabel :validatedInput="validatableInputs['floorInput']">
			<template v-slot:label>Apartment Group</template>
			<div class="join">
				<SelectInput class="join-item" v-model="getAcf().edificio" :allowEmpty="false" :options="GetValidBuildings()" :render="building=>building.title.rendered" :getSearchValue="building=>building.title.rendered" :buttonClasses="['join-item']"></SelectInput>
				<div class="btn btn-info join-item" @click="ViewObj('building', getAcf().edificio)">Edit</div>
			</div>

			<template v-slot:invalid>Cannot be empty</template>
		</InputLabel>
	</div>
	<div class="overflow-x-auto">
		<table class="table">
			<!-- head -->
			<thead>
				<tr>
					<th>Apartment</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="apartment in GetChildApartments()" :key="apartment.id">
					<td>{{apartment.title.rendered}}</td>
					<td>
						<button class="btn btn-info btn-xs" @click="ViewObj('apartment', apartment.id)">Edit</button>
					</td>
				</tr>

			</tbody>
			
		</table>
		<div class="flex justify-center items-center gap-3">
			<div class="btn btn-success" @click="CreateApartment()">Create new apartment</div>
		</div>
	</div>
</template>
<style scoped lang="scss">
</style>