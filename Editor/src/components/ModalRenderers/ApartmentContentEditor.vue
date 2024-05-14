<script setup>

	import {ref, computed, shallowReactive, watch, reactive} from "vue";
	import {formValueValidation, ParseYMDString} from "@/Utils.js";
	import TextInput from "@/components/FormElements/TextInput.vue"
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
		const innerID = data.acf.inner_id;
		const group = ObjectCache.GetObject('group', data.acf.group);
		if(group == null){
			data.title = innerID;
			return;
		}
		const building = ObjectCache.GetObject('building', group.acf.edificio);
		data.title = `${innerID} &#8212; ${building.acf.title} &#8212; ${data.acf.floor} &#8212; ${data.acf.number}`;
	});
	console.log(objectData);
	function getAcf(){
		return objectData.acf;
	};

	
	const inputGroup = reactive(useValidationGroup());
	const syncGroup = reactive(useValidationGroup());

	function AddSyncItem(){
		getAcf().sync.push({label:'', url:''})
	}
	function GetApartmentReservations(){
		return ObjectCache.GetSegmentRows('reservation').filter(reservation => reservation.acf.apartment == objectData.id);
	}
	function GetValidGroups(){
		let currentGroup = ObjectCache.GetObject('group', getAcf().group);
		let rows = ObjectCache.GetSegmentRows('group').filter(group => group.acf.edificio == currentGroup.acf.edificio);
		return rows.reduce((a, v) => ({ ...a, [v.id]: v}), {}) 
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

	defineExpose({
		isValid: () => inputGroup.isValid() && syncGroup.isValid(),
		GetTitle,
	});
</script>
<template>

	<div role="tablist" class="tabs tabs-lifted">
		<input type="radio" name="apartmentTabs" role="tab" class="tab" aria-label="Info" checked />
		<div role="tabpanel" class="tab-content">
			<InputLabel :validatedInput="inputGroup.elements['innerIdInput']">
				<template v-slot:label>Apartment identifier</template>
				<TextInput :ref="el => inputGroup.elements['innerIdInput'] = el" v-model="getAcf().inner_id" placeholder="Enter apartment identifier" :validate="formValueValidation.notEmpty">
				</TextInput>
				<template v-slot:invalid>Cannot be empty</template>
			</InputLabel>
			<InputLabel :validatedInput="inputGroup.elements['title']">
				<template v-slot:label>Apartment identifier</template>
				<TextInput :ref="el => inputGroup.elements['title'] = el" v-model="getAcf().title" placeholder="Enter apartment title" :validate="formValueValidation.notEmpty">
				</TextInput>
				<template v-slot:invalid>Cannot be empty</template>
			</InputLabel>
			<div class="w-fit">
				<InputLabel>
					<template v-slot:label>Apartment Group</template>
					<div class="join">
						<SelectInput class="join-item" v-model="getAcf().group" :allowEmpty="false" :options="GetValidGroups()" :render="group=>group.acf.title" :getSearchValue="group=>group.acf.title" :buttonClasses="['join-item']"></SelectInput>
						<div class="btn btn-info join-item" @click="ViewObj('group', getAcf().group)">Edit</div>
					</div>
				</InputLabel>
			</div>
			<InputLabel :validatedInput="inputGroup.elements['bathrooms']">
				<template v-slot:label>Bathrooms</template>
				<TextInput type="number" :ref="el => inputGroup.elements['bathrooms'] = el" v-model="getAcf().bathrooms" placeholder="1" :validate="formValueValidation.notEmpty">
				</TextInput>
				<template v-slot:invalid>Cannot be empty</template>
			</InputLabel>
			<InputLabel>
				<template v-slot:label>Apartment Address</template>
				<div class="join w-full">
					<TextInput :ref="el => inputGroup.elements['floorInput'] = el" v-model="getAcf().floor" placeholder="0" :validate="formValueValidation.notEmpty" type='number' class="join-item grow max-w-32">
						<template v-slot:before>Floor:</template>
					</TextInput>
					<TextInput :ref="el => inputGroup.elements['doorInput'] = el" v-model="getAcf().number" placeholder="11" :validate="formValueValidation.notEmpty" type='text' class="join-item grow max-w-32">
						<template v-slot:before>Door:</template>
					</TextInput>
				</div>
			</InputLabel>

			<div class="collapse collapse-arrow bg-base-200 my-5" :class="{'ring-1 ring-error': !syncGroup.isValid()}">
				<input type="checkbox" /> 
				<div class="collapse-title text-xl font-medium">
					Sincronización
				</div>
				<div class="collapse-content"> 
					<div class="">
						<div class="group/syncItem" v-for="(syncItem,id) in getAcf().sync" :key="id">
							<div class="flex">
								<div class="join join-vertical w-0 grow">
									<TextInput :ref="el => syncGroup.elements[`syncItem${id}Label`] = el" v-model="syncItem.label" placeholder="Nombre de plataforma" :validate="formValueValidation.notEmpty" type='text' class="join-item grow min-w-0">
										<template v-slot:before><span class="font-bold">Etiqueta:</span></template>
									</TextInput>
									<TextInput :ref="el => syncGroup.elements[`syncItem${id}URL`] = el" v-model="syncItem.url" :validate="formValueValidation.notEmpty" placeholder="link" type='text' class="join-item grow min-w-0">
										<template v-slot:before><span class="font-bold">Link:</span></template>
									</TextInput>
								</div>

								<div class="flex justify-center items-center p-2">
									<div class="btn btn-warning btn-sm btn-circle" @click="getAcf().sync.splice(id,1)">
										<i class="fa-solid fa-minus"></i>
									</div>
								</div>
							</div>
							<div class="divider group-last/syncItem:hidden"></div> 
						</div>
					</div>
					<div class="flex justify-center items-center gap-3 mt-4">
						<div class="btn btn-secondary btn-circle text-xl" @click="AddSyncItem()">
							<i class="fa-solid fa-plus"></i>
						</div>
					</div>	
				</div>
			</div>
		</div>

		<input type="radio" name="apartmentTabs" role="tab" class="tab" aria-label="Reservations" />
		<div role="tabpanel" class="tab-content">
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
		</div>
	</div>
	
  	
</template>
<style scoped lang="scss">
</style>