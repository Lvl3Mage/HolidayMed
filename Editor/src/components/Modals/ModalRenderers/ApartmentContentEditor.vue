<script setup>

import {computed, reactive, ref} from "vue";
import {formValueValidation, ParseYMDString, ToYMDString} from "@/Utils.js";
import Input from "@/components/FormElements/Input.vue";
import InputLabel from "@/components/FormElements/InputLabel.vue";
import SelectInput from "@/components/FormElements/SelectInput.vue";
import TableDataDisplay from "@/components/TableDataDisplay.vue";
import CacheSegmentRenderer from "@/components/CacheSegmentRenderer.vue";
import ArrayContentEditor from "@/components/FormElements/ArrayContentEditor.vue";


import {useObjectCache} from "@/stores/ObjectCache";
import {useUIManagement} from "@/stores/UIManagment.js";
import {useValidationGroup} from "@/components/FormElements/ValidationGroup.js";
import {useObjectData} from "@/components/Modals/ModalRenderers/ObjectData.js";
import TabDisplay from "@/components/FormElements/TabDisplay.vue";
import ImageSelector from "@/components/FormElements/ImageSelector.vue";
import {useAppConfig} from "@/stores/AppConfig";
import DateRangeCalendar from "@/components/DateRangeCalendar.vue";
import {DateRangeIntersect} from "@/DateUtils";

const ObjectCache = useObjectCache();
const UIManagement = useUIManagement();
const AppConfig = useAppConfig();
const props = defineProps({
	objectData: {
		type: Object,
		required: true,
	},
});


const objectData = useObjectData(props.objectData, (data) => {
	const innerID = data.acf.inner_id;
	const building = ObjectCache.GetObject("building", data.acf.building);
	data.title = `${innerID} &#8212; ${building?.acf?.title || "---"} &#8212; ${data.acf.floor} &#8212; ${data.acf.number}`;
	data.bedroom = data.acf.rooms.length;
});

function getAcf() {
	return objectData.acf;
}
function CalendarLink() {
	return `https://holidaymed.es/calendar/?action=export&apartment=${objectData.id}`;
}
function CopyApartmentLink() {
	navigator.clipboard.writeText(CalendarLink());
}

const syncGroup = reactive(useValidationGroup());
const roomGroup = reactive(useValidationGroup());

function GetApartmentReservations() {
	return ObjectCache.GetSegmentRows("reservation").filter(reservation => reservation.acf.apartment == objectData.id);
}

function ViewObj(objectType, objectId) {
	UIManagement.OpenEditObjectModal(objectType, objectId).then((result) => {
		console.log(result.code, result.data);
	}).catch((error) => {
		console.error(error.code, error.data);
	});
}

function RenderReservationOrder(object) {
	if (ObjectCache.GetObject("order", object.acf.order) == null) {
		return "Order not found";
	}
	return `<div class="underline cursor-pointer">
				${ObjectCache.GetObject("order", object.acf.order).title.rendered}
			</div>`;
}

function RenderDate(date) {
	return date.toLocaleString(
		"es-ES",
		{
			year: "numeric",
			month: "numeric",
			day: "numeric",
		},
	);
}

function GetTitle() {
	return objectData.title;
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
const test = ref(null);


const displayedMonth = ref(new Date());

const syncColors = ["bg-warning/60", "bg-success/60", "bg-info/60", "bg-secondary/60"];

function GetSyncBlocks() {
	return getAcf().sync.map((sync, index) => {
		if (sync.blocked_dates === undefined || sync.blocked_dates === null) {
			return [];
		}
		return sync.blocked_dates.map(block => {

			return {
				startDate: block.dtstart,
				endDate: block.dtend,
				data: sync,
				colorClass: syncColors[index % syncColors.length],
			};
		});
	});
}
function ApartmentReservations() {
	return ObjectCache.GetSegmentRows("reservation").filter(reservation => reservation.acf.apartment === objectData.id);
}
function RemoveImage(image){
	for (let i in objectData.acf.images){
		let imgID = objectData.acf.images[i];
		if(imgID === image.id){
			objectData.acf.images.splice(i,1);
		}
	}
}
function GetBlockedRanges() {
	const reservationBlocks = ApartmentReservations().map(
		(reservation) => {
			return {
				startDate: reservation.acf.start_date,
				endDate: reservation.acf.end_date,
				colorClass: "bg-error/60",
			};
		});
	const selfBlocks = [];
	const sync = GetSyncBlocks();
	return [...reservationBlocks, ...selfBlocks, ...sync.flat()];
}

const calendar = ref(null);

function GetDaysInRange(range) {
	let selectedDays = [];
	let day = range[0];
	while (day <= range[1]) {
		selectedDays.push(day);
		//console.log(day);
		day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
	}
	return selectedDays;
}

function ModifyCustomBlockRanges(range, modifPredicate = (a, b) => a.union(b)) {

	//Fucking spaghetti all of this
	let blocks = getAcf().self_blocked_dates;
	if (blocks === undefined || blocks === null) {
		blocks = [];
	}
	let selectedDays = new Set(GetDaysInRange(range).map(ToYMDString));

	let blockedDays = new Set();
	for (let i = blocks.length - 1; i >= 0; i--) {
		let block = blocks[i];
		let start = ParseYMDString(block.dtstart);
		let end = ParseYMDString(block.dtend);
		if (DateRangeIntersect(start, end, range[0], range[1])) {
			let days = new Set(GetDaysInRange([start, end]).map(ToYMDString));
			blockedDays = blockedDays.union(days);
			blocks.splice(i, 1);
		}
	}
	blockedDays = modifPredicate(blockedDays, selectedDays);
	blockedDays = Array.from(blockedDays)
	.map(ParseYMDString)
	.sort((a, b) => a.getTime() - b.getTime());

	if (blockedDays.length === 0) {
		return;
	}
	let start = blockedDays[0];
	let end = blockedDays[0];
	//console.log("Blocked", blockedDays);
	for (let i = 1; i < blockedDays.length; i++) {
		let day = blockedDays[i];
		if (day.getTime() - end.getTime() > 24 * 60 * 60 * 1000) {
			blocks.push({
				dtstart: ToYMDString(start),
				dtend: ToYMDString(end),
			});
			start = day;
			end = day;
			continue;
		}
		end = day;
	}
	blocks.push({
		dtstart: ToYMDString(start),
		dtend: ToYMDString(end),
	});
}

function AddCustomBlock() {
	const selectionRange = calendar.value?.GetSelectionRange();
	if (!selectionRange) {
		return;
	}
	if (selectionRange[0] === null || selectionRange[1] === null) {
		return;
	}
	ModifyCustomBlockRanges(selectionRange, (a, b) => a.union(b));
	//console.log(getAcf().self_blocked_dates);
}

function RemoveCustomBlock() {
	const selectionRange = calendar.value?.GetSelectionRange();
	if (!selectionRange) {
		return;
	}
	if (selectionRange[0] === null || selectionRange[1] === null) {
		return;
	}
	ModifyCustomBlockRanges(selectionRange, (a, b) => a.difference(b));
	//console.log(getAcf().self_blocked_dates);

}

const customBlocks = computed(() => {
	if (objectData.acf.self_blocked_dates === undefined || objectData.acf.self_blocked_dates === null) {
		return [];
	}
	return objectData.acf.self_blocked_dates.map(block => {
		return {
			startDate: block.dtstart,
			endDate: block.dtend,
		};
	});
});
const selectedReservations = computed(() => {
	// const selectionRange = calendar.value?.GetSelectionRange();
	// if (!selectionRange) {
	// 	return [];
	// }
	// if (selectionRange[0] === null || selectionRange[1] === null) {
	// 	return [];
	// }
	if(calendar.value === null){
		return [];
	}

	let range = calendar.value?.DisplayRangeOfMonth(displayedMonth.value);
	return ApartmentReservations().filter((reservation) => {
		return DateRangeIntersect(
			ParseYMDString(reservation.acf.start_date),
			ParseYMDString(reservation.acf.end_date),
			range[0],
			range[1]
		);
	});
});
const selectedSync = computed(() => {
	// const selectionRange = calendar.value?.GetSelectionRange();
	return getAcf().sync.map((sync) => {
		const data = {
			label: sync.label,
			url: sync.url,
			blocks: [],
		};
		// if (!selectionRange) {
		// 	return data;
		// }
		// if (selectionRange[0] === null || selectionRange[1] === null) {
		// 	return data;
		// }

		if(calendar.value === null){
			return data;
		}
		if (sync.blocked_dates === undefined || sync.blocked_dates === null) {
			return data;
		}
		let range = calendar.value?.DisplayRangeOfMonth(displayedMonth.value);
		data.blocks = sync.blocked_dates.filter(block => {
			return DateRangeIntersect(
				ParseYMDString(block.dtstart),
				ParseYMDString(block.dtend),
				range[0],
				range[1],
			);
		});
		return data;
	});
});
defineExpose({
	isValid: () => tabDisplay.value?.isValid(),
	GetTitle,
});
</script>
<template>
	<TabDisplay :tabs="{
		info: {name: 'Info', validationElements: [syncGroup, roomGroup]},
		filters: {name: 'Filtros'},
		images: {name: 'Imagines'},
		reservations: {name: 'Reservas'},
		calender: {name: 'Calendario'},
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
				<template v-slot:label>Apartment identifier</template>
				<Input :ref="el => validationGroup.elements['title'] = el" v-model="getAcf().title"
				       placeholder="Enter apartment title" :validate="formValueValidation.notEmpty">
				</Input>
				<template v-slot:invalid>Cannot be empty</template>
			</InputLabel>
			<div class="w-fit">
				<InputLabel>
					<template v-slot:label>Apartment Group</template>
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

					<div class="text-lg">
						Calendar Link
					</div>
					<div class="flex gap-2 items-center mb-3">
						<div class="italic text-sm ">
							{{ CalendarLink() }}
						</div>
						<button class="btn btn-sm btn-info" @click="CopyApartmentLink">Copiar</button>

					</div>
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
			<h2>Rooms</h2>
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
						<div class="flex justify-between items-center px-2" >
							<div class="text-center pt-2 opacity-0" :class="{'!opacity-100':isSelected}">
								Portada
							</div>
							<button class="btn btn-circle btn-xs" @click.prevent.stop="RemoveImage(item)">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="w-2/3"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>

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
		<template #reservations>
			<div class="divider">Reservations</div>
			<CacheSegmentRenderer type="reservation" class="min-h-44">
				<TableDataDisplay :rows="GetApartmentReservations()" :compact="true" :showRowNumbers="false"
				                  :rowsPerPage="10" :fields="[
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
				]"/>
			</CacheSegmentRenderer>
			<!-- TODO
			<div class="flex justify-center items-center gap-3 mt-4">
				<div class="btn btn-success" @click="CreateReservation()">Create new reservation</div>
			</div> -->
		</template>
		<template #calender="{validationGroup}">
			<DateRangeCalendar ref="calendar" class="w-full m-auto max-w-md"
			                   v-model:displayed-month="displayedMonth"
			                   :blocked-ranges="GetBlockedRanges()"
			                   :disabled-ranges="customBlocks"></DateRangeCalendar>
			<div class="flex gap-2 justify-end mt-5">
				<button class="btn btn-secondary" @click="RemoveCustomBlock()">Unblock</button>
				<button class="btn btn-primary" @click="AddCustomBlock()">Block</button>
			</div>
			<div class="divider"></div>
			<div class="flex justify-start gap-2 items-center">
				<div class="text-sm">
					Selection:
				</div>
				<div class="badge badge-info">{{ calendar?.GetSelectionRange()[0]?.toDateString() }}</div>
				<div class="">-</div>
				<div class="badge badge-info">{{ calendar?.GetSelectionRange()[1]?.toDateString() }}</div>
			</div>

			<div class="divider"></div>
			<div class="collapse has-[:checked]:overflow-visible collapse-plus border-base-300 bg-base-200 border z-0">

				<input type="checkbox" class="peer"/>
				<div class="collapse-title text-xl font-medium capitalize">
					Reservas - {{ selectedReservations.length }} -
					<span class="inline-block px-2 py-2 rounded-sm capitalize bg-error/60">
					</span>
				</div>
				<div class="collapse-content">

					<TableDataDisplay :actions="[
						{
							render(){
								return `<div class='btn btn-accent btn-xs'>Edit</div>`;
							},
							onClick(row){
								UIManagement.OpenEditObjectModal(`order`, row.acf.order);
							},
						}
					]"
					                  :fields="[
						{
							displayName: 'Start Date',
							render(row){
							  return ParseYMDString(row.acf.start_date).toDateString();
							},
						},
						{
							displayName: 'End Date',
							render(row){
							  return ParseYMDString(row.acf.end_date).toDateString();
							},
						},
					]"
					                  :rows="selectedReservations"></TableDataDisplay>
				</div>
			</div>


			<div class="" v-for="(sync,index) in selectedSync">
				<div class="divider"></div>
				<div
					class="collapse has-[:checked]:overflow-visible collapse-plus border-base-300 bg-base-200 border z-0">

					<input type="checkbox" class="peer"/>
					<div class="collapse-title text-xl font-medium capitalize">
						{{ sync.label }} - {{ sync.blocks.length }} -
						<span class="inline-block px-2 py-2 rounded-sm capitalize"
						      :class="syncColors[index % syncColors.length]">
						</span>
					</div>
					<div class="collapse-content">

						<TableDataDisplay
							:fields="[
							{
								displayName: 'UId',
								render(row){
								  return row.uid;
								},
							},
							{
								displayName: 'Summary',
								render(row){
								  return row.summary;
								},
							},
							{
								displayName: 'Start Date',
								render(row){
								  return ParseYMDString(row.dtstart).toDateString();
								},
							},
							{
								displayName: 'End Date',
								render(row){
								  return ParseYMDString(row.dtend).toDateString();
								},
							},
						]"
							:rows="sync.blocks"></TableDataDisplay>
					</div>
				</div>


			</div>
		</template>
	</TabDisplay>
</template>