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
		const title = data.acf.title;
		const building = ObjectCache.GetObject('building', data.acf.edificio);
		data.title = `${building.acf.title} &#8212; ${title}`;
	});

	function getAcf(){
		return objectData.acf;
	};

	const inputGroup = reactive(useValidationGroup());

	function GetValidBuildings(){
		return ObjectCache.GetSegmentData('building');
	}

	function AddSeasonalPrice(){
		getAcf().prices.season_prices.push({
			base_price: null,
        	promo_price: null,
        	start_date: '',
        	end_date: '',
		});
	}

	function ViewObj(objectType, objectId){
		UIManagment.OpenEditObjectModal(objectType, objectId).then((result) => {
			console.log(result.code, result.data);
		}).catch((error) => {
			console.error(error.code, error.data);
		});
	}
	defineExpose({
		isValid: inputGroup.isValid,
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
	<InputLabel :validatedInput="inputGroup.elements['titleInput']">
		<template v-slot:label>Group Title</template>
		<TextInput :ref="el => inputGroup.elements['titleInput'] = el" v-model="objectData.acf.title" placeholder="Enter group title" :validate="formValueValidation.notEmpty" type='text'>
		</TextInput>
		<template v-slot:invalid>Cannot be empty</template>
	</InputLabel>
	<InputLabel>
		<template v-slot:label>Descripcion</template>
		<TextAreaInput :v-model="getAcf().description" placeholder="Descripcion del edificio" type='text'>
		</TextAreaInput>
	</InputLabel>
	<div class="collapse collapse-arrow bg-base-200 my-5" :class="{'ring-1 ring-error': !priceGroup.isValid()}">
		<input type="checkbox" /> 
		<div class="collapse-title text-xl font-medium">
			Precios
		</div>
		
		<div class="collapse-content"> 

			<InputLabel :validatedInput="priceGroup.elements['basePrice']">
				<template v-slot:label>Precio basico</template>
				<TextInput :ref="el => priceGroup.elements['basePrice'] = el" v-model="getAcf().prices.base_price" placeholder="100" :validate="formValueValidation.notEmpty" type='number'>
				</TextInput>
				<template v-slot:invalid>Cannot be empty</template>
			</InputLabel>
			<InputLabel :validatedInput="priceGroup.elements['promoPrice']">
				<template v-slot:label>Precio promocional</template>
				<TextInput :ref="el => priceGroup.elements['promoPrice'] = el" v-model="getAcf().prices.promo_price" placeholder="100" :validate="formValueValidation.notEmpty" type='number'>
				</TextInput>
				<template v-slot:invalid>Cannot be empty</template>
			</InputLabel>
			<div class="mt-5">
				<div class="group/seasonalPrice" v-for="(seasonalPrice,id) in getAcf().prices.season_prices" :key="id">
					<div class="flex">
						<div class="join join-horizontal sm:join-vertical w-0 grow">
							<TextInput :ref="el => priceGroup.elements[`season${id}basePrice`] = el" v-model="seasonalPrice.base_price" placeholder="100" :validate="formValueValidation.notEmpty" type='text' class="join-item grow min-w-0 basis-0 sm:basis-auto">
								<template v-slot:before><span class="font-bold">Precio basico:</span></template>
							</TextInput>
							<TextInput :ref="el => priceGroup.elements[`season${id}promoPrice`] = el" v-model="seasonalPrice.promo_price" placeholder="100" :validate="formValueValidation.notEmpty" type='text' class="join-item grow min-w-0 basis-0 sm:basis-auto">
								<template v-slot:before><span class="font-bold">Precio promocional:</span></template>
							</TextInput>
							<TextInput :ref="el => priceGroup.elements[`season${id}start`] = el" v-model="seasonalPrice.start_date" placeholder="" :validate="formValueValidation.notEmpty" type='date' class="join-item grow min-w-0 basis-0 sm:basis-auto">
								<template v-slot:before><span class="font-bold">Fecha inicial:</span></template>
							</TextInput>
							<TextInput :ref="el => priceGroup.elements[`season${id}end`] = el" v-model="seasonalPrice.end_date" placeholder="" :validate="formValueValidation.notEmpty" type='date' class="join-item grow min-w-0 basis-0 sm:basis-auto">
								<template v-slot:before><span class="font-bold">Fecha final:</span></template>
							</TextInput>
						</div>

						<div class="flex justify-center items-center p-2">
							<div class="btn btn-warning btn-sm btn-circle" @click="getAcf().prices.season_prices.splice(id,1)">
								<i class="fa-solid fa-minus"></i>
							</div>
						</div>
					</div>
					<div class="divider group-last/location:hidden"></div> 
				</div>
			</div>
			<div class="flex justify-center items-center gap-3 mt-4">
				<div class="btn btn-secondary btn-circle text-xl" @click="AddSeasonalPrice()">
					<i class="fa-solid fa-plus"></i>
				</div>
			</div>	
		</div>
	</div>


</template>
<style scoped lang="scss">
</style>