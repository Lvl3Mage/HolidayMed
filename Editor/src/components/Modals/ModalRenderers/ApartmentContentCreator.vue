<script setup>

import {ref, computed, shallowReactive, watch, reactive} from "vue";
import {formValueValidation} from "@/Utils.js";
import Input from "@/components/FormElements/Input.vue";
import InputLabel from "@/components/FormElements/InputLabel.vue";
import SelectInput from "@/components/FormElements/SelectInput.vue";
import CacheSegmentRenderer from "@/components/CacheSegmentRenderer.vue";


import {useObjectCache} from "@/stores/ObjectCache";
import {useUIManagement} from "@/stores/UIManagment.js";
import {useObjectData} from "@/components/Modals/ModalRenderers/ObjectData.js";
import TabDisplay from "@/components/FormElements/TabDisplay.vue";
import {useValidationGroup} from "@/components/FormElements/ValidationGroup";
import ArrayContentEditor from "@/components/FormElements/ArrayContentEditor.vue";
import {useAppConfig} from "@/stores/AppConfig";
import ImageSelector from "@/components/FormElements/ImageSelector.vue";

const ObjectCache = useObjectCache();
const UIManagement = useUIManagement();
const AppConfig = useAppConfig()

const props = defineProps({
	objectData: {
		type: Object,
		required: true,
	},
});
const objectData = useObjectData(props.objectData, (data) => {
	const innerID = data.acf.inner_id;
	const building = ObjectCache.GetObject("building", data.acf.building);
	if (!building) {
		return;
	}
	data.title = `${innerID} &#8212; ${building.acf.title} &#8212; ${data.acf.floor} &#8212; ${data.acf.number}`;
});


const syncGroup = reactive(useValidationGroup());
const roomGroup = reactive(useValidationGroup());
function getAcf() {
	return objectData.acf;
}

function ViewObj(objectType, objectId) {
	UIManagement.OpenEditObjectModal(objectType, objectId).then((result) => {
		console.log(result.code, result.data);
	}).catch((error) => {
		console.error(error.code, error.data);
	});
}

function GetMedia(mediaId) {
	return ObjectCache.GetObject("media", mediaId);
}

function GetSelectedMedia() {
	return getAcf().images.map(GetMedia).filter(media => media !== undefined);
}

function SelectMedia() {
	UIManagement.OpenModal("select-image", {selectMultiple: true, selected: getAcf().images}).then((result) => {
		if (result.code === "selected") {
			getAcf().images = result.data;
		}
	}).catch((error) => {
		UIManagement.OpenToast({
			closeOnClick: true,
			lifetime: 1000,
			appearance: "error",
			text: `Something went wrong: ${error}`,
		});
	});
}

const tabDisplay = ref(null);
defineExpose({
	isValid: () => tabDisplay.value?.isValid(),
	GetTitle: () => "Creating Apartment",
});
</script>
<template>
	<TabDisplay :tabs="{
		info: {name: 'Info', validationElements: [syncGroup, roomGroup]},
		filters: {name: 'Filtros'},
		images: {name: 'Imagines'},
		reservations: {name: 'Reservations'},
	}" :ref="el=>tabDisplay = el">
		<template #info="{validationGroup}">
			<InputLabel :validatedInput="validationGroup.elements['innerIdInput']">
				<template v-slot:label>Apartment identifier</template>
				<Input :ref="el => validationGroup.Add(el, 'innerIdInput')" v-model="getAcf().inner_id"
				       placeholder="Enter apartment identifier" :validate="formValueValidation.notEmpty">
				</Input>
				<template v-slot:invalid>Cannot be empty</template>
			</InputLabel>
			<InputLabel :validatedInput="validationGroup.elements['title']">
				<template v-slot:label>Apartment title</template>
				<Input :ref="el => validationGroup.elements['title'] = el" v-model="getAcf().title"
				       placeholder="Enter apartment title" :validate="formValueValidation.notEmpty">
				</Input>
				<template v-slot:invalid>Cannot be empty</template>
			</InputLabel>
			<div class="w-fit">
				<InputLabel>
					<template v-slot:label>Apartment Building</template>
					<div class="join">
						<SelectInput class="join-item" v-model="getAcf().building" :allowEmpty="false"
						             :options=" ObjectCache.GetSegmentData('building')"
						             :render="building=>building.acf.title"
						             :getSearchValue="building=>building.acf.title"
						             buttonClass="join-item"></SelectInput>
						<div class="btn btn-info join-item" @click="ViewObj('building', getAcf().building)">Edit</div>
					</div>
				</InputLabel>
			</div>
			<InputLabel :validatedInput="validationGroup.elements['bathrooms']">
				<template v-slot:label>Bathrooms</template>
				<Input type="number" :ref="el => validationGroup.elements['bathrooms'] = el"
				       v-model="getAcf().bathrooms" placeholder="1" :validate="formValueValidation.notEmpty">
				</Input>
				<template v-slot:invalid>Cannot be empty</template>
			</InputLabel>
			<InputLabel>
				<template v-slot:label>Apartment Address</template>
				<div class="join w-full">
					<Input :ref="el => validationGroup.elements['floorInput'] = el" v-model="getAcf().floor"
					       placeholder="0" :validate="formValueValidation.notEmpty" type='number'
					       class="join-item grow max-w-32">
						<template v-slot:before>Floor:</template>
					</Input>
					<Input :ref="el => validationGroup.elements['doorInput'] = el" v-model="getAcf().number"
					       placeholder="11" :validate="formValueValidation.notEmpty" type='text'
					       class="join-item grow max-w-32">
						<template v-slot:before>Door:</template>
					</Input>
				</div>
			</InputLabel>

			<div class="collapse collapse-arrow bg-base-200 my-5" :class="{'ring-1 ring-error': !syncGroup.isValid()}">
				<input type="checkbox"/>
				<div class="collapse-title text-xl font-medium">
					Sincronización
				</div>
				<div class="collapse-content">
					<ArrayContentEditor :validation-group="syncGroup" :value="getAcf().sync"
					                    :element-constructor="() => ({label:'', url:''})" v-slot="{index, item}">
						<Input :ref="el => syncGroup.Add(el,  `syncItem${index}Label`)" v-model="item.label"
						       placeholder="Nombre de plataforma" :validate="formValueValidation.notEmpty" type='text'
						       class="join-item grow min-w-0">
							<template v-slot:before><span class="font-bold">Etiqueta:</span></template>
						</Input>
						<Input :ref="el => syncGroup.Add(el,  `syncItem${index}Link`)" v-model="item.url"
						       :validate="formValueValidation.notEmpty" placeholder="link" type='text'
						       class="join-item grow min-w-0">
							<template v-slot:before><span class="font-bold">Link:</span></template>
						</Input>
					</ArrayContentEditor>
				</div>
			</div>
			<div class="divider"></div>
			<h2 class="text-2xl">Rooms</h2>
			<ArrayContentEditor :validation-group="roomGroup" :value="getAcf().rooms"
			                    :element-constructor="() => ({room_type:'',beds:[]})" v-slot="roomData"
			                    item-class="flex flex-col gap-2">
				<InputLabel :validatedInput="roomGroup.elements[`roomType${roomData.index}`]">
					<template v-slot:label>Room type</template>
					<SelectInput :ref="el => roomGroup.Add(el, `roomType${roomData.index}`)"
					             v-model="roomData.item.room_type"
					             :options="AppConfig.GetDictionary().roomTypes"
					             :render="(type)=>type.label.single">
					</SelectInput>
				</InputLabel>
				<div
					class="collapse has-[:checked]:overflow-visible collapse-plus border-base-300 bg-base-200 border z-0">

					<input type="checkbox" class="peer"/>
					<div class="collapse-title text-xl font-medium">Beds</div>
					<div class="collapse-content">
						<ArrayContentEditor :validation-group="roomGroup" :value="roomData.item.beds"
						                    :element-constructor="() => ({bed:''})" v-slot="bedData">
							<InputLabel
								:validatedInput="roomGroup.elements[`roomType${roomData.index}bedType${bedData.index}`]">
								<template v-slot:label>Bed Type</template>
								<SelectInput
									:ref="el => roomGroup.Add(el, `roomType${roomData.index}bedType${bedData.index}`)"
									v-model="bedData.item.bed"
									:options="AppConfig.GetDictionary().bedTypes"
									:render="(type)=>type.label.single">
								</SelectInput>
							</InputLabel>
						</ArrayContentEditor>
					</div>
				</div>
			</ArrayContentEditor>
		</template>
		<template #filters="{validationGroup}">
			<div class="" v-for="groupKey in Object.keys(getAcf().auto_filters)">
				<div class="divider">{{ AppConfig.GetFilterGroup(groupKey).title }}</div>
				<div class="">
					<div class="" v-for="elementKey in Object.keys(getAcf().auto_filters[groupKey])">
						<template v-if="AppConfig.GetFilterElement(elementKey).type === 'true_false'">
							<label class="label cursor-pointer">
								<span class="label-text">{{ AppConfig.GetFilterElement(elementKey).subtitle }}</span>
								<input type="checkbox" v-model="getAcf().auto_filters[groupKey][elementKey]"
								       class="checkbox"/>
							</label>
						</template>
						<template v-else-if="AppConfig.GetFilterElement(elementKey).type === 'number'">
							<InputLabel :validatedInput="validationGroup.elements[elementKey]">
								<template v-slot:label>{{ AppConfig.GetFilterElement(elementKey).subtitle }}</template>
								<Input :ref="el => validationGroup.Add(el, elementKey)"
								       type="number"
								       v-model="getAcf().auto_filters[groupKey][elementKey]"
								       placeholder="Enter value" :validate="formValueValidation.notEmpty">
								</Input>
								<template v-slot:invalid>Cannot be empty</template>
							</InputLabel>
						</template>
					</div>

				</div>
			</div>
		</template>
		<template #images="{validationGroup}">
			<div class="divider">Seleccion de imagen portada</div>
			<CacheSegmentRenderer :render-when-loading="true" type="media">
				<ImageSelector v-model:selection="test"
				               :display-selected-filter="false"
				               :display-search="false"
				               :media="GetSelectedMedia()"
				               :process-media="true"
				               :scroll="false"
				               v-slot="{item, isSelected, toggleSelection}">
					<div @click="toggleSelection()"
					     class="card bg-base-100 w-32 max-w-full shadow-xl cursor-pointer outline outline-0 hover:outline-2 outline-secondary transition"
					     :class="{' bg-base-200 !opacity-100 outline-4 ':isSelected}">
						<div class="text-center pt-2 opacity-0" :class="{'!opacity-100':isSelected}">
							Portada
						</div>
						<img :src="item.url"
						     class="w-full h-full object-contain rounded p-3 contrast-50 transition"
						     :class="{'!contrast-100':isSelected}"/>
						<div class="text-xs text-center break-all p-1" v-html="item.title" v-if="item.title">
						</div>
					</div>
				</ImageSelector>

			</CacheSegmentRenderer>
			<div class="divider"></div>
			<div class="flex justify-center">
				<button class="btn btn-accent" @click="SelectMedia()">Seleccionar otras imagines</button>
			</div>
		</template>
	</TabDisplay>

</template>
<style scoped lang="scss">
</style>