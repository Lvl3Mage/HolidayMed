<script setup>
import {computed, ref, watch} from "vue";
import Pagination from "@/components/FormElements/Pagination.vue";
import Input from "@/components/FormElements/Input.vue";
import Fuse from "fuse.js";

const props = defineProps({
	media: {
		type: Array,
		required: true,
	},
	processMedia: {
		type: Boolean,
		required: false,
		default: false,
	},
	selectMultiple: {
		type: Boolean,
		required: false,
		default: false,
	},
	allowEmpty: {
		type: Boolean,
		required: false,
		default: false,
	},
	rowsPerPage: {
		type: Number,
		required: false,
		default: 25,
	},
	scroll: {
		type: Boolean,
		required: false,
		default: false,
	},
	scrollWrapperClass: {
		type: String,
		required: false,
		default: "h-[45vh]",
	},
	displaySearch: {
		type: Boolean,
		required: false,
		default: true,
	},
	displaySelectedFilter: {
		type: Boolean,
		required: false,
		default: true,
	},
});


const selection = defineModel('selection',{
	type: [Array, Number],
	required: false,
	default: undefined,
});
const selectedItems = computed({
		get: () => {
			if(!SelectMultiple()){
				return [selection.value];
			}
			return selection.value;
		},
		set: (value) => {
			if (SelectMultiple()) {
				selection.value = value;
			}
			else{
				selection.value = value[0];
			}
		}
	},
);
function SelectMode() {
	return props.selection !== undefined;
}

function SelectMultiple() {
	return props.selectMultiple;
}
function IsMediaSelected(mediaId) {
	if (!SelectMode()) {
		return;
	}
	return selectedItems.value.includes(mediaId);
}

function ToggleSelection(mediaId) {
	if (!SelectMode()) {
		return;
	}
	if (IsMediaSelected(mediaId)) {
		selectedItems.value.splice(selectedItems.value.indexOf(mediaId), 1);
	}
	else {
		if (SelectMultiple()) {
			selectedItems.value.push(mediaId);
		}
		else {
			selectedItems.value = [mediaId];
		}
	}
}

function isValid() {
	return selectedItems.value.length > 0 || props.allowEmpty;
}

function SearchRows(rows, getSearchValue, query) {
	if (query == "") {
		return rows;
	}

	const options = {
		shouldSort: true,
	};

	const fuse = new Fuse(rows.map(row => getSearchValue(row)), options);
	const result = fuse.search(query);
	return result.map(resRow => rows[resRow.refIndex]);
}

const searchQuery = ref("");
watch(searchQuery, () => {
	ResetDisplay();
});


const displaySelected = ref(false);

const paginationDisplay = ref(null);

function ResetDisplay() {
	paginationDisplay.value?.SetPageIndex(0);
	ResetDisplayScroll();
}

const imageDisplay = ref(null);

function ResetDisplayScroll() {
	imageDisplay.value.scrollTo(0, 0);
}


const imageRows = computed(() => {
	let data = props.media;
	console.log(data);
	if (props.processMedia) {
		data = data.map(row => ({
			title: row.title.rendered,
			url: row.media_details.sizes?.thumbnail?.source_url || row.media_details.sizes?.medium?.source_url || row.link,
			id: row.id,
		}));
	}
	// console.log(data);
	data = SearchRows(data, row => row.title, searchQuery.value);
	if (displaySelected.value) {
		data = data.filter(row => IsMediaSelected(row.id));
	}
	return data;
});

function SelectId(id) {
	if (IsMediaSelected(id)) {
		return;
	}
	ToggleSelection(id);
}

function DeselectId(id) {
	if (!IsMediaSelected(id)) {
		return;
	}
	ToggleSelection(id);
}

defineExpose({
	ResetDisplayScroll,
	ResetDisplay,
	isValid,
	ToggleSelection,
	SelectId,
	DeselectId,
});
</script>

<template>
	<div>
		<Input class="min-w-full shadow-md" v-model="searchQuery" v-if="props.displaySearch">
			<template v-slot:after><i class="fa-solid fa-magnifying-glass"></i></template>
		</Input>
		<label class="label cursor-pointer" v-if="SelectMode() && props.displaySelectedFilter">
			<span class="label-text">Show selected</span>
			<input type="checkbox" v-model="displaySelected" @change="ResetDisplay()" class="checkbox"/>
		</label>
		<pagination @change="ResetDisplayScroll()" ref="paginationDisplay" :items="imageRows"
		            :items-per-page="props.rowsPerPage" v-slot="{items, index}">
			<div class="py-4 mt-2" :class="{[props.scrollWrapperClass]:props.scroll, 'overflow-auto':props.scroll}" ref="imageDisplay">
				<div class="flex flex-wrap gap-3 justify-around">
					<template v-for="item in items">
						<slot :item="item" :isSelected="IsMediaSelected(item.id)" :toggleSelection="()=>ToggleSelection(item.id)">
							<div v-if="SelectMode()" @click="ToggleSelection(item.id)"
							     class="card bg-base-100 w-32 max-w-full shadow-xl cursor-pointer outline outline-0 hover:outline-2 outline-secondary transition"
							     :class="{' bg-base-200 !opacity-100 outline-4 ':IsMediaSelected(item.id)}">
								<img :src="item.url"
								     class="w-full h-full object-contain rounded p-3 contrast-50 transition"
								     :class="{'!contrast-100':IsMediaSelected(item.id)}"/>
								<div class="text-xs text-center break-all p-1" v-html="item.title" v-if="item.title">
								</div>
							</div>
							<div v-else class="card bg-base-100 w-32 max-w-full shadow-xl">
								<img :src="item.url" class="w-full h-full object-contain rounded p-3  transition"/>
								<div class="text-xs text-center break-all p-1" v-html="item.title" v-if="item.title">
								</div>
							</div>
						</slot>
					</template>
				</div>
				<div class="" v-if="items.length === 0">
					No media found
				</div>
			</div>
		</pagination>
		
	</div>
</template>