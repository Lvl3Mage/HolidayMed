<script setup>

	import {ref, computed, watch, shallowReactive, reactive} from "vue";
	import {formValueValidation} from "@/Utils.js";
	import TextInput from "@/components/FormElements/TextInput.vue"
	import TextAreaInput from "@/components/FormElements/TextAreaInput.vue"
	import InputLabel from "@/components/FormElements/InputLabel.vue"
	import SelectInput from '@/components/FormElements/SelectInput.vue';
	import TableDataDisplay from '@/components/TableDataDisplay.vue';
	import CacheSegmentRenderer from '@/components/CacheSegmentRenderer.vue';



	import {useObjectCache} from '@/stores/ObjectCache'
	import {useUIManagment} from '@/stores/UIManagment.js'
	import {useValidationGroup} from '@/components/FormElements/ValidationGroup.js'
	import {useObjectData} from '@/components/ModalRenderers/ObjectData.js'

	const ObjectCache = useObjectCache();
	const UIManagment = useUIManagment();


	const props = defineProps({
		objectData: {
			type: Object,
			required: true,
		},
	});
	const objectData = useObjectData(props.objectData, (data)=>{
		data.title = data.acf.title;
	});

	function getAcf(){
		return objectData.acf;
	};

	const infoGroup = reactive(useValidationGroup());
	const locationsGroup = reactive(useValidationGroup());
	const rulesGroup = reactive(useValidationGroup());

	const validatedGroups = [infoGroup, locationsGroup, rulesGroup];
	function isValid(){
		return validatedGroups.every(group => group.isValid());
	}
	function ViewObj(objectType, objectId){
		UIManagment.OpenEditObjectModal(objectType, objectId).then((result) => {
			console.log(result.code, result.data);
		}).catch((error) => {
			console.error(error.code, error.data);
		});
	}
	function AddLocation(){
		getAcf().locations.push({
			place: '', 
			distance: null, 
			unidades: ''
		});
	}
	function AddRule(){
		getAcf().rules.push({
			title: '', 
			text: '',
			image: null,
			description: ''
		});
	}
	
	function GetTitle(){
		return objectData.title;
	}
	defineExpose({
		isValid,
		GetTitle
	});
</script>
<template>
	<InputLabel :validatedInput="infoGroup.elements['titleInput']">
		<template v-slot:label>Title</template>
		<TextInput :ref="el => infoGroup.elements['titleInput'] = el" v-model="getAcf().title" placeholder="Enter Building title" :validate="formValueValidation.notEmpty" type='text'>
		</TextInput>
		<template v-slot:invalid>Cannot be empty</template>
	</InputLabel>
	<InputLabel :validatedInput="infoGroup.elements['seasidePosition']">
		<template v-slot:label>Seaside position</template>
		<TextInput :ref="el => infoGroup.elements['seasidePosition'] = el" v-model="getAcf().seaside_position" placeholder="1" :validate="formValueValidation.notEmpty" type='text'>
		</TextInput>
		<template v-slot:invalid>Cannot be empty</template>
	</InputLabel>
	<div class="collapse collapse-arrow bg-base-200 my-5" :class="{'ring-1 ring-error': !locationsGroup.isValid()}">
		<input type="checkbox" /> 
		<div class="collapse-title text-xl font-medium">
			Locations
		</div>
		
		<div class="collapse-content"> 
			<div class="">
				<div class="group/location" v-for="(location,id) in getAcf().locations" :key="id">
					<div class="flex">
						<div class="join join-horizontal sm:join-vertical w-0 grow">
							<TextInput :ref="el => locationsGroup.elements[`location${id}Place`] = el" v-model="location.place" placeholder="Playa" :validate="formValueValidation.notEmpty" type='text' class="join-item grow min-w-0 basis-0 sm:basis-auto">
								<template v-slot:before><span class="font-bold">Place:</span></template>
							</TextInput>
							<TextInput :ref="el => locationsGroup.elements[`location${id}Distance`] = el" v-model="location.distance" placeholder="10" :validate="formValueValidation.notEmpty" type='number' class="join-item grow min-w-0 basis-0 sm:basis-auto">
								<template v-slot:before><span class="font-bold">Distance:</span></template>
							</TextInput>
							<TextInput :ref="el => locationsGroup.elements[`location${id}Unit`] = el" v-model="location.unidades" placeholder="Playa" :validate="formValueValidation.notEmpty" type='text' class="join-item grow min-w-0 basis-0 sm:basis-auto">
								<template v-slot:before><span class="font-bold">Unit:</span></template>
							</TextInput>
						</div>

						<div class="flex justify-center items-center p-2">
							<div class="btn btn-warning btn-sm btn-circle" @click="getAcf().locations.splice(id,1)">
								<i class="fa-solid fa-minus"></i>
							</div>
						</div>
					</div>
					<div class="divider group-last/location:hidden"></div> 
				</div>
			</div>
			<div class="flex justify-center items-center gap-3 mt-4">
				<div class="btn btn-secondary btn-circle text-xl" @click="AddLocation()">
					<i class="fa-solid fa-plus"></i>
				</div>
			</div>	
		</div>
	</div>
	<div class="collapse collapse-arrow bg-base-200 my-5" :class="{'ring-1 ring-error': !rulesGroup.isValid()}">
		<input type="checkbox" /> 
		<div class="collapse-title text-xl font-medium">
			Rules
		</div>
		<div class="collapse-content"> 
			<div class="">
				<div class="group/rule" v-for="(rule,id) in getAcf().rules" :key="id">
					<div class="flex">
						<div class="join join-vertical w-0 grow">
							<TextInput :ref="el => rulesGroup.elements[`rule${id}Title`] = el" v-model="rule.title" placeholder="Rule title" :validate="formValueValidation.notEmpty" type='text' class="join-item grow min-w-0">
								<template v-slot:before><span class="font-bold">Title:</span></template>
							</TextInput>
							<TextInput v-model="rule.text" placeholder="Rule text" type='text' class="join-item grow min-w-0">
								<template v-slot:before><span class="font-bold">Text:</span></template>
							</TextInput>
							<TextAreaInput  rows="4" v-model="rule.description" placeholder="Rule description" type='text' class="join-item grow min-w-0">
							</TextAreaInput>
						</div>

						<div class="flex justify-center items-center p-2">
							<div class="btn btn-warning btn-sm btn-circle" @click="getAcf().rules.splice(id,1)">
								<i class="fa-solid fa-minus"></i>
							</div>
						</div>
					</div>
					<div class="divider group-last/rule:hidden"></div> 
				</div>
			</div>
			<div class="flex justify-center items-center gap-3 mt-4">
				<div class="btn btn-secondary btn-circle text-xl" @click="AddRule()">
					<i class="fa-solid fa-plus"></i>
				</div>
			</div>	
		</div>
	</div>
</template>