<script setup>

	import {ref, computed, shallowReactive, watch, reactive} from "vue";
	import {formValueValidation, ParseYMDString} from "@/Utils.js";
	import Input from "@/components/FormElements/Input.vue"
	import InputLabel from "@/components/FormElements/InputLabel.vue"
	import SelectInput from '@/components/FormElements/SelectInput.vue';
	import TableDataDisplay from '@/components/TableDataDisplay.vue';
	import CacheSegmentRenderer from '@/components/CacheSegmentRenderer.vue';
	import ArrayContentEditor from "@/components/FormElements/ArrayContentEditor.vue";



	import {useObjectCache} from '@/stores/ObjectCache'
	import {useUIManagement} from '@/stores/UIManagment.js'
	import {useValidationGroup} from '@/components/FormElements/ValidationGroup.js'
	import {useObjectData} from '@/components/Modals/ModalRenderers/ObjectData.js'
	import TabDisplay from "@/components/FormElements/TabDisplay.vue";

	const ObjectCache = useObjectCache();
	const UIManagment = useUIManagement();

	const props = defineProps({
		objectData: {
			type: Object,
			required: true,
		},
	});

	
	const objectData = useObjectData(props.objectData, (data)=>{
		
		console.log('title render')
		const innerID = data.acf.inner_id;
		const building = ObjectCache.GetObject('building', data.acf.building);
		data.title = `${innerID} &#8212; ${building?.acf?.title || '---'} &#8212; ${data.acf.floor} &#8212; ${data.acf.number}`;
	});
	function getAcf(){
		return objectData.acf;
	};

	
	const syncGroup = reactive(useValidationGroup());

	function GetApartmentReservations(){
		return ObjectCache.GetSegmentRows('reservation').filter(reservation => reservation.acf.apartment == objectData.id);
	}
	function ViewObj(objectType, objectId){
		UIManagment.OpenEditObjectModal(objectType, objectId).then((result) => {
			console.log(result.code, result.data);
		}).catch((error) => {
			console.error(error.code, error.data);
		});
	}
	function RenderReservationOrder(object){
		if(ObjectCache.GetObject('order', object.acf.order) == null){
			return 'Order not found';
		}
		return ObjectCache.GetObject('order', object.acf.order).title.rendered;
	}
	function RenderDate(date){
		return date.toLocaleString("es-ES",
		{
			year: "numeric",
			month: "numeric",
			day: "numeric",
		});
	}
	function GetTitle(){
		return objectData.title;
	}
	const tabDisplay = ref(null);

	defineExpose({
		isValid: () => tabDisplay.value?.isValid(),
		GetTitle,
	});
</script>
<template>
	<TabDisplay :tabs="{
		info: {name: 'Info', validationElements: [syncGroup]},
		images: {name: 'Imagines'},
		reservations: {name: 'Reservations'},
	}" :ref="el=>tabDisplay = el">
		<template #info="{validationGroup}">
			<InputLabel :validatedInput="validationGroup.elements['innerIdInput']">
				<template v-slot:label>Apartment identifier</template>
				<Input :ref="el => validationGroup.Add(el, 'innerIdInput')" v-model="getAcf().inner_id" placeholder="Enter apartment identifier" :validate="formValueValidation.notEmpty">
				</Input>
				<template v-slot:invalid>Cannot be empty</template>
			</InputLabel>
			<InputLabel :validatedInput="validationGroup.elements['title']">
				<template v-slot:label>Apartment identifier</template>
				<Input :ref="el => validationGroup.elements['title'] = el" v-model="getAcf().title" placeholder="Enter apartment title" :validate="formValueValidation.notEmpty">
				</Input>
				<template v-slot:invalid>Cannot be empty</template>
			</InputLabel>
			<div class="w-fit">
				<InputLabel>
					<template v-slot:label>Apartment Group</template>
					<div class="join">
						<SelectInput class="join-item" v-model="getAcf().building" :allowEmpty="false" :options=" ObjectCache.GetSegmentData('building')" 
						             :render="building=>building.acf.title" 
						             :getSearchValue="building=>building.acf.title" buttonClass="join-item"></SelectInput>
						<div class="btn btn-info join-item" @click="ViewObj('building', getAcf().building)">Edit</div>
					</div>
				</InputLabel>
			</div>
			<InputLabel :validatedInput="validationGroup.elements['bathrooms']">
				<template v-slot:label>Bathrooms</template>
				<Input type="number" :ref="el => validationGroup.elements['bathrooms'] = el" v-model="getAcf().bathrooms" placeholder="1" :validate="formValueValidation.notEmpty">
				</Input>
				<template v-slot:invalid>Cannot be empty</template>
			</InputLabel>
			<InputLabel>
				<template v-slot:label>Apartment Address</template>
				<div class="join w-full">
					<Input :ref="el => validationGroup.elements['floorInput'] = el" v-model="getAcf().floor" placeholder="0" :validate="formValueValidation.notEmpty" type='number' class="join-item grow max-w-32">
						<template v-slot:before>Floor:</template>
					</Input>
					<Input :ref="el => validationGroup.elements['doorInput'] = el" v-model="getAcf().number" placeholder="11" :validate="formValueValidation.notEmpty" type='text' class="join-item grow max-w-32">
						<template v-slot:before>Door:</template>
					</Input>
				</div>
			</InputLabel>

			<div class="collapse collapse-arrow bg-base-200 my-5" :class="{'ring-1 ring-error': !syncGroup.isValid()}">
				<input type="checkbox" /> 
				<div class="collapse-title text-xl font-medium">
					Sincronización
				</div>
				<div class="collapse-content">
					<ArrayContentEditor :validation-group="syncGroup" :value="getAcf().sync" :element-constructor="() => ({label:'', url:''})" v-slot="{index, item}">
						<Input :ref="el => syncGroup.Add(el,  `syncItem${index}Label`)" v-model="item.label" placeholder="Nombre de plataforma" :validate="formValueValidation.notEmpty" type='text' class="join-item grow min-w-0">
							<template v-slot:before><span class="font-bold">Etiqueta:</span></template>
						</Input>
						<Input :ref="el => syncGroup.Add(el,  `syncItem${index}Link`)" v-model="item.url" :validate="formValueValidation.notEmpty" placeholder="link" type='text' class="join-item grow min-w-0">
							<template v-slot:before><span class="font-bold">Link:</span></template>
						</Input>
					</ArrayContentEditor>
				</div>
			</div>
		</template>
		<template #images="{validationGroup}">
			<div class="divider">Imagines</div>
			<ArrayContentEditor :validation-group="validationGroup" :value="getAcf().images" :element-constructor="() => ({label:'', url:''})" v-slot="{index, item}">
				<SelectInput :ref="el=> validationGroup.Add(el,  `image${index}`)" class="join-item" v-model="getAcf().images[index]" 
				             :allowEmpty="false" 
				             :options="ObjectCache.GetSegmentData('media')"
				             :maxOptions="10"
				             :render="building=>building.title.rendered" 
				             :getSearchValue="building=>building.title.rendered" buttonClass="join-item"></SelectInput>
			</ArrayContentEditor>
		</template>
		
		<template #reservations>
			<div class="divider">Reservations</div>
		  	<CacheSegmentRenderer type="reservation" class="min-h-44" >
				<TableDataDisplay :rows="GetApartmentReservations()" :compact="true" :showRowNumbers="false" :rowsPerPage="10" :fields="[
					{
						displayName: 'Title',
						render: (object) => object.title.rendered,
						getSortValue: (object) => object.title.rendered,
						getSearchValue: (object) => object.title.rendered,
					},
					{
						displayName: 'Start date',
						render: (object) => RenderDate(ParseYMDString(object.acf.start_date)), // Ymd formatted string
						getSortValue: (object) => ParseYMDString(object.acf.start_date).getTime(),
					},
					{
						displayName: 'End date',
						render: (object) => RenderDate(ParseYMDString(object.acf.end_date)), // Ymd formatted string
						getSortValue: (object) => ParseYMDString(object.acf.end_date).getTime(),
					},
					{
						displayName: 'Order',
						render: RenderReservationOrder,
						onClick: (object) => ViewObj('order', object.acf.order),
					},
				]"
				:actions="[
					{
						render: (object) => `<button class='btn btn-info btn-xs'>Edit</button>`,
						onClick: (object) => UIManagment.OpenEditObjectModal('reservation', object.id),
					},
				]"/>
			</CacheSegmentRenderer>
			<!-- TODO
			<div class="flex justify-center items-center gap-3 mt-4">
				<div class="btn btn-success" @click="CreateReservation()">Create new reservation</div>
			</div> -->
		</template>
	</TabDisplay>
</template>