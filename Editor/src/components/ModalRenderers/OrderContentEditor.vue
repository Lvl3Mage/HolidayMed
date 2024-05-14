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
		data.title = `№${data.id}} | ${data.acf.order_data.dates.start} - ${data.acf.order_data.dates.end} | ${data.acf.order_data.contact_info.name} ${data.acf.order_data.contact_info.surname}`;
	});
	function getAcf(){
		return objectData.acf;
	};

	
	const inputGroup = reactive(useValidationGroup());

	function ViewObj(objectType, objectId){
		UIManagment.OpenEditObjectModal(objectType, objectId).then((result) => {
			console.log(result.code, result.data);
		}).catch((error) => {
			console.error(error.code, error.data);
		});
	}
	function GetTitle(){
		return objectData.title;
	}
	function RenderDate(date){
		return date.toLocaleString("es-ES",
		{
			year: "numeric",
			month: "numeric",
			day: "numeric",
		});
	}
	function GetOrderReservations(){
		return ObjectCache.GetSegmentRows('reservation').filter(reservation => reservation.acf.order == objectData.id);
	}
	defineExpose({
		isValid: () => inputGroup.isValid(),
		GetTitle,
	});
</script>
<template>

	<div role="tablist" class="tabs tabs-lifted">
		<input type="radio" name="orderTabs" role="tab" class="tab" aria-label="Info" checked />
		<div role="tabpanel" class="tab-content">
			<InputLabel :validatedInput="inputGroup.elements['guestCount']">
				<template v-slot:label>Numero de huespedes</template>
				<TextInput :ref="el => inputGroup.elements['guestCount'] = el" v-model="getAcf().order_data.guests_count" placeholder="5" :validate="formValueValidation.notEmpty" type="number">
				</TextInput>
				<template v-slot:invalid>Cannot be empty</template>
			</InputLabel>
			<InputLabel :validatedInput="inputGroup.elements['priceTotal']">
				<template v-slot:label>Precio total</template>
				<TextInput :ref="el => inputGroup.elements['priceTotal'] = el" v-model="getAcf().order_data.prices.total" placeholder="" type="number" :validate="formValueValidation.notEmpty" disabled>
				</TextInput>
				<template v-slot:invalid>Cannot be empty</template>
			</InputLabel>
			<InputLabel>
				<template v-slot:label>Formulario de pago</template>
				<TextInput  v-model="getAcf().order_data.pay_info.payment_form.label" placeholder="" disabled >
				</TextInput>
			</InputLabel>
			<InputLabel>
				<template v-slot:label>Forma de pago</template>
				<TextInput  v-model="getAcf().order_data.pay_info.payment_method.label" placeholder="" disabled >
				</TextInput>
			</InputLabel>
			<InputLabel :validatedInput="inputGroup.elements['clientName']">
				<template v-slot:label>Nombre</template>
				<TextInput :ref="el => inputGroup.elements['clientName'] = el" :validate="formValueValidation.notEmpty" v-model="getAcf().order_data.contact_info.name" placeholder="" >
				</TextInput>
			</InputLabel>
			<InputLabel :validatedInput="inputGroup.elements['clientSurname']">
				<template v-slot:label>Apellido</template>
				<TextInput :ref="el => inputGroup.elements['clientSurname'] = el" :validate="formValueValidation.notEmpty" v-model="getAcf().order_data.contact_info.surname" placeholder="" >
				</TextInput>
			</InputLabel>
			<InputLabel :validatedInput="inputGroup.elements['clientEmail']">
				<template v-slot:label>Correo Electronico</template>
				<TextInput :ref="el => inputGroup.elements['clientEmail'] = el" :validate="formValueValidation.notEmpty" v-model="getAcf().order_data.contact_info.email" placeholder="" >
				</TextInput>
			</InputLabel>
			<InputLabel :validatedInput="inputGroup.elements['clientPhone']">
				<template v-slot:label>Numero de telefono</template>
				<TextInput :ref="el => inputGroup.elements['clientPhone'] = el" :validate="formValueValidation.notEmpty" v-model="getAcf().order_data.contact_info.phone" placeholder="" type="number">
				</TextInput>
			</InputLabel>
		</div>
		<input type="radio" name="orderTabs" role="tab" class="tab" aria-label="Reservations" />
		<div role="tabpanel" class="tab-content">
			<div class="divider">Reservations</div>
		  	<CacheSegmentRenderer type="reservation" class="min-h-44" >
				<TableDataDisplay :rows="GetOrderReservations()" :compact="true" :showRowNumbers="false" :rowsPerPage="10" :fields="[
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
						displayName: 'Apartamento',
						render: (object) => {
							const apartment = ObjectCache.GetObject('apartment', object.acf.apartment);
							if(apartment){
								return `
									<span class='link'>
										${apartment.title.rendered}
									</span>
								`;
							}
							return `<span class='loading loading-dots loading-xs'></span>`
						},
						onClick: (object) => {
							UIManagment.OpenEditObjectModal('apartment',object.acf.apartment);
						},
						getSortValue: (object) => {
							const apartment = ObjectCache.GetObject('apartment', object.acf.apartment);
							if(apartment){
								return apartment.title.rendered;
							}
							return '';
						},
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