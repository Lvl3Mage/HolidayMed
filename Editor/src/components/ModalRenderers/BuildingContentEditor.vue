<script setup>

	import {ref, computed, watch, shallowReactive, reactive} from "vue";
	import {formValueValidation} from "@/Utils.js";
	import Input from "@/components/FormElements/Input.vue"
	import ArrayContentEditor from "@/components/FormElements/ArrayContentEditor.vue"
	import TextAreaInput from "@/components/FormElements/TextAreaInput.vue"
	import InputLabel from "@/components/FormElements/InputLabel.vue"
	import SelectInput from '@/components/FormElements/SelectInput.vue';
	import TableDataDisplay from '@/components/TableDataDisplay.vue';
	import CacheSegmentRenderer from '@/components/CacheSegmentRenderer.vue';



	import {useObjectCache} from '@/stores/ObjectCache'
	import {useUIManagement} from '@/stores/UIManagment.js'
	import {useValidationGroup} from '@/components/FormElements/ValidationGroup.js'
	import {useObjectData} from '@/components/ModalRenderers/ObjectData.js'

	const ObjectCache = useObjectCache();
	const UIManagment = useUIManagement();


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

	const validatedGroups = ref([infoGroup, locationsGroup, rulesGroup]);
	function isValid(){
		return validatedGroups.value.every(group => group.isValid());
	}
	function GetChildApartments(){
		return ObjectCache.GetSegmentRows('apartment').filter(apartment =>apartment.acf.building == objectData.id);
	}

	function ViewObj(objectType, objectId){
		UIManagment.OpenEditObjectModal(objectType, objectId).then((result) => {
			console.log(result.code, result.data);
		}).catch((error) => {
			console.error(error.code, error.data);
		});
	}
	function AddRule(){
		getAcf().rules.push({title: '', text: '', image: null, description: ''});
	}
	
	function GetTitle(){
		return objectData.title;
	}
	defineExpose({
		isValid,
		GetTitle
	});
	const image = ref(null);
</script>
<template>
	<!-- <InputLabel>

		<template v-slot:label>Image</template>
		<div class="join">
			<SelectInput :ref="el => infoGroup.elements['imageInput'] = el" class="join-item" v-model="getAcf().group" 
				:allowEmpty="false" 
				:options="ObjectCache.GetSegmentRows('media')" 
				:render="media=>`
					<div class='flex gap-2 items-center'>
						<img class='h-6' src='${media.link}' alt='Preview'>
						<span>${media.title.rendered.slice(0,20)}</span>
					</div>
				`"
				:maxOptions="10" 
				:getSearchValue="media=>media.title.rendered" 
				:buttonClasses="['join-item']">
			</SelectInput>
			<div class="btn btn-info join-item" @click="ViewObj('group', getAcf().group)">Edit</div>
		</div>
	</InputLabel> -->
	<div role="tablist" class="tabs tabs-lifted">
		<input type="radio" name="buildingTabs" role="tab" class="tab" aria-label="Info" checked />
		<div role="tabpanel" class="tab-content">
			<InputLabel :validatedInput="infoGroup.elements['titleInput']">
				<template v-slot:label>Title</template>
				<Input :ref="el => infoGroup.elements['titleInput'] = el" v-model="getAcf().title" placeholder="Enter Building title" :validate="formValueValidation.notEmpty" type='text'>
				</Input>
				<template v-slot:invalid>Cannot be empty</template>
			</InputLabel>
			<div class="collapse collapse-arrow bg-base-200 my-5" :class="{'ring-1 ring-error': !locationsGroup.isValid()}">
				<input type="checkbox" /> 
				<div class="collapse-title text-xl font-medium">
					Locations
				</div>
				
				<div class="collapse-content"> 
					<ArrayContentEditor :validation-group="locationsGroup" :value="getAcf().locations" :element-constructor="() => ({place : '', distance: null, unidades: ''})" v-slot="{index, item}">
						<Input :ref="el => locationsGroup.Add(el, `location${index}Place`)" v-model="item.place" placeholder="Playa" :validate="formValueValidation.notEmpty" type='text' class="join-item grow min-w-0 basis-0 sm:basis-auto">
							<template v-slot:before><span class="font-bold">Place:</span></template>
						</Input>
						<Input :ref="el => locationsGroup.Add(el,`location${index}Distance`)" v-model="item.distance" placeholder="10" :validate="formValueValidation.notEmpty" type='number' class="join-item grow min-w-0 basis-0 sm:basis-auto">
							<template v-slot:before><span class="font-bold">Distance:</span></template>
						</Input>
						<Input :ref="el => locationsGroup.Add(el,`location${index}Unit`)" v-model="item.unidades" placeholder="Playa" :validate="formValueValidation.notEmpty" type='text' class="join-item grow min-w-0 basis-0 sm:basis-auto">
							<template v-slot:before><span class="font-bold">Unit:</span></template>
						</Input>
					</ArrayContentEditor>
				</div>
			</div>
			<div class="collapse collapse-arrow bg-base-200 my-5" :class="{'ring-1 ring-error': !rulesGroup.isValid()}">
				<input type="checkbox" /> 
				<div class="collapse-title text-xl font-medium">
					Rules
				</div>
				<div class="collapse-content"> 
					<ArrayContentEditor :validation-group="rulesGroup" :value="getAcf().rules" :element-constructor="() => ({title: '', text: '', image: null, description: ''})" item-class="join join-vertical" v-slot="{index, item}">
						<Input :ref="el => rulesGroup.Add(el, `rule${index}Title`)" v-model="item.title" placeholder="Rule title" :validate="formValueValidation.notEmpty" type='text' class="join-item grow min-w-0">
							<template v-slot:before><span class="font-bold">Title:</span></template>
						</Input>
						<Input v-model="item.text" placeholder="Rule text" type='text' class="join-item grow min-w-0">
							<template v-slot:before><span class="font-bold">Text:</span></template>
						</Input>
						<TextAreaInput  rows="4" v-model="item.description" placeholder="Rule description" type='text' class="join-item grow min-w-0">
						</TextAreaInput>
					</ArrayContentEditor>
				</div>
			</div>
		</div>

		<input type="radio" name="buildingTabs" role="tab" class="tab" aria-label="Child apartments" />
		<div role="tabpanel" class="tab-content">
			<div class="divider">Building Apartments</div>
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
		</div>
	</div>
</template>