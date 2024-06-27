<script setup>

	import {ref, computed, shallowReactive, watch, reactive} from "vue";
	import {formValueValidation} from "@/Utils.js";
	import Input from "@/components/FormElements/Input.vue"
	import InputLabel from "@/components/FormElements/InputLabel.vue"
	import SelectInput from '@/components/FormElements/SelectInput.vue';
	import TableDataDisplay from '@/components/TableDataDisplay.vue';
	import CacheSegmentRenderer from '@/components/CacheSegmentRenderer.vue';



	import {useObjectCache} from '@/stores/ObjectCache'
	import {useUIManagement} from '@/stores/UIManagment.js'
	import {useValidationGroup} from '@/components/FormElements/ValidationGroup.js'
	import {useObjectData} from '@/components/ModalRenderers/ObjectData.js'

	const ObjectCache = useObjectCache();
	const UIManagement = useUIManagement();


	const props = defineProps({
		objectData: {
			type: Object,
			required: true,
		},
	});
	const objectData = useObjectData(props.objectData, (data)=>{
		const innerID = data.acf.inner_id;
		const building = ObjectCache.GetObject('building', data.acf.building);
		if (!building) {
			return;
		}
		data.title = `${innerID} &#8212; ${building.acf.title} &#8212; ${data.acf.floor} &#8212; ${data.acf.number}`;
	});


	function getAcf(){
		return props.objectData.acf;
	};

	
	const inputGroup = reactive(useValidationGroup());

	function ViewObj(objectType, objectId){
		UIManagement.OpenEditObjectModal(objectType, objectId).then((result) => {
			console.log(result.code, result.data);
		}).catch((error) => {
			console.error(error.code, error.data);
		});
	}
	defineExpose({
		isValid : inputGroup.isValid,
		GetTitle: () => "Creating Apartment",
	});
</script>
<template>
	<InputLabel :validatedInput="inputGroup.elements['innerIdInput']">
		<template v-slot:label>Apartment identifier</template>
		<Input :ref="el => inputGroup.elements['innerIdInput'] = el" v-model="getAcf().inner_id" placeholder="Enter apartment identifier" :validate="formValueValidation.notEmpty">
		</Input>
		<template v-slot:invalid>Cannot be empty</template>
	</InputLabel>
	<InputLabel :validatedInput="inputGroup.elements['title']">
		<template v-slot:label>Apartment title</template>
		<Input :ref="el => inputGroup.elements['title'] = el" v-model="getAcf().title" placeholder="Enter apartment title" :validate="formValueValidation.notEmpty">
		</Input>
		<template v-slot:invalid>Cannot be empty</template>
	</InputLabel>
	<div class="w-fit">
		<InputLabel>
			<template v-slot:label>Apartment Building</template>
			<div class="join">
				<SelectInput class="join-item" v-model="getAcf().building" :allowEmpty="false" :options=" ObjectCache.GetSegmentRows('building')" :render="building=>building.title.rendered" :getSearchValue="building=>building.title.rendered" :buttonClasses="['join-item']"></SelectInput>
				<div class="btn btn-info join-item" @click="ViewObj('building', getAcf().building)">Edit</div>
			</div>
		</InputLabel>
	</div>
	<InputLabel>
		<template v-slot:label>Apartment Address</template>
		<div class="join w-full">
			<Input :ref="el => inputGroup.elements['floorInput'] = el" v-model="getAcf().floor" placeholder="0" :validate="formValueValidation.notEmpty" type='number' class="join-item grow max-w-32">
				<template v-slot:before>Floor:</template>
			</Input>
			<Input :ref="el => inputGroup.elements['doorInput'] = el" v-model="getAcf().number" placeholder="11" :validate="formValueValidation.notEmpty" type='text' class="join-item grow max-w-32">
				<template v-slot:before>Door:</template>
			</Input>
		</div>
	</InputLabel>
</template>
<style scoped lang="scss">
</style>