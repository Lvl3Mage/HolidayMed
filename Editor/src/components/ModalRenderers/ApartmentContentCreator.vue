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


	function getAcf(){
		return props.objectData.acf;
	};

	
	const inputGroup = reactive(useValidationGroup());

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
	defineExpose({
		isValid : inputGroup.isValid,
		GetTitle: () => "Creating Apartment",
	});
</script>
<template>
	<InputLabel :validatedInput="inputGroup.elements['innerIdInput']">
		<template v-slot:label>Apartment identifier</template>
		<TextInput :ref="el => inputGroup.elements['innerIdInput'] = el" v-model="getAcf().inner_id" placeholder="Enter apartment identifier" :validate="formValueValidation.notEmpty">
		</TextInput>
		<template v-slot:invalid>Cannot be empty</template>
	</InputLabel>
	<div class="w-fit">
		<InputLabel>
			<template v-slot:label>Apartment Group</template>
			<div class="join">
				<SelectInput class="join-item" v-model="getAcf().group" :allowEmpty="false" :options="GetValidGroups()" :render="group=>group.title.rendered" :getSearchValue="group=>group.title.rendered" :buttonClasses="['join-item']"></SelectInput>
				<div class="btn btn-info join-item" @click="ViewObj('group', getAcf().group)">Edit</div>
			</div>
		</InputLabel>
	</div>
	<InputLabel :validatedInput="inputGroup.elements['titleInput']">
		<template v-slot:label>Apartment Title</template>
		<TextInput :ref="el => inputGroup.elements['titleInput'] = el" v-model="getAcf().title" placeholder="Enter apartment title" :validate="formValueValidation.notEmpty" type='text'>
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
</template>
<style scoped lang="scss">
</style>