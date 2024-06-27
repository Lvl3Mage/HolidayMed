<script setup>
	import { ref, computed, watch } from 'vue';
	import Input from '@/components/FormElements/Input.vue';
	import Fuse from 'fuse.js'

	const props = defineProps({
		rows: {
			type: Array,
			required: true,
		}, 
		fields: {
			type: Array,
			required: true,
		},
		showRowNumbers:{
			type: Boolean,
			required: false,
		},
		actions: {
			type: Array,
			required: false,
		},
		compact:{
			type: Boolean,
			required: false,
		},
		rowsPerPage:{
			type: Number,
			required: false,
		},
	});
	//TODO implement sorting by fields and search by fields
	/*[
		{
			displayName: "id", // required
			render: (object) => object.id, // required
			onClick: (object) => console.log(object), // optional
			getSortValue: (object) => object.id, // optional
			getSearchValue: (object) => object.id, // optional
		}
	]*/
	
	




	
	const pageIndex = ref(0);
	function SortRows(rows, field){
		if(field.getSortValue == undefined){
			return rows;
		}
		return rows.slice().sort((a, b) => {
			const aValue = field.getSortValue(a);
			const bValue = field.getSortValue(b);
			if(aValue < bValue){
				return invertSort.value ? 1 : -1;
			}
			if(aValue > bValue){
				return invertSort.value ? -1 : 1;
			}
			return 0;
		});
	}
	function SearchRows(rows, field, query){
		if(!field.getSearchValue || query == ""){
			return rows;
		}

		const options = {
			shouldSort: true,
		};
		const fuse = new Fuse(rows.map(row => field.getSearchValue(row)), options)
		const result = fuse.search(query);
		return result.map(resRow => rows[resRow.refIndex]);
	}

	function HandleFieldClick(row, field){
		if(field.onClick){
			field.onClick(row);
		}
	}

	function PaginationIndexVisible(index, checkNeightbours = true){
		if(props.rowsPerPage){
			if(index < 2 || index >= GetPageCount()-2 || Math.abs(index - pageIndex.value) < 2){
				return true;
			}
			if(!checkNeightbours){
				return false;
			}
			return PaginationIndexVisible(index-1,false) && PaginationIndexVisible(index+1, false);
		}
		return true;
	}
	function GetPageCount(){
		if(!props.rowsPerPage || processedRows.value.length == 0){
			return 1;
		}
		return Math.ceil(processedRows.value.length/props.rowsPerPage);
	}

	const sortFieldIndex = ref(-1);
	const invertSort = ref(false);
	function SwitchSortField(fieldIndex){
		sortFieldIndex.value = fieldIndex;
		invertSort.value = false;
		DisableSearch();
	}
	function DisableSort(){
		sortFieldIndex.value = -1;
		invertSort.value = false;
	}
	const searchValue = ref('');
	const searchFieldIndex = ref(-1);
	watch(searchValue, (newValue) => { // reset page index when search value changes
		pageIndex.value = 0;
	});

	function ToggleSearchField(fieldIndex){
		if(searchFieldIndex.value == fieldIndex){
			searchFieldIndex.value = -1;

		}
		else{
			searchFieldIndex.value = fieldIndex;
			pageIndex.value = 0;// reset page index when search field changes
			DisableSort();
			
		}
		searchValue.value = '';
	}
	function DisableSearch(){
		searchFieldIndex.value = -1;
		searchValue.value = '';
	}

	const processedRows = computed(() => {
		let rows = props.rows;
		if(searchFieldIndex.value != -1){
			rows = SearchRows(rows, props.fields[searchFieldIndex.value], searchValue.value);
		}
		else if(sortFieldIndex.value != -1){
			rows = SortRows(rows, props.fields[sortFieldIndex.value]);
		}
		return rows;
	});
	const currentPageRows = computed(() => {
		if(props.rowsPerPage){
			return processedRows.value.slice(pageIndex.value*props.rowsPerPage, (pageIndex.value+1)*props.rowsPerPage);
		}
		return processedRows.value;
	});
	const pageOffsetIndex = computed(() => {
		if(props.rowsPerPage){
			return pageIndex.value*props.rowsPerPage;
		}
		return 0;
	});

</script>
<template>
	<table class="table" :class="{'table-xs' : props.compact}">
		<thead>
			<tr>
				<th v-if="props.showRowNumbers" class="select-none">
					#
				</th>
				<th v-for="(field, fieldIndex) in props.fields" :key="fieldIndex" >
					<div class="">
						<span class="pr-1 select-none">
							{{field.displayName}}
						</span>

						<span v-if="field.getSortValue" class=" relative">
							<span class="" @click="SwitchSortField(fieldIndex)">
								<i class="fa-solid fa-sort cursor-pointer px-1"></i>
							</span>
							<span class="absolute left-0 top-0 bottom-0 z-10" v-if="sortFieldIndex == fieldIndex">
								<span  @click="invertSort = true" v-if="!invertSort">
									<i class="fa-solid fa-sort-up text-info cursor-pointer px-1"></i>
								</span>
								<span  @click="DisableSort()" v-else>
									<i class="fa-solid fa-sort-down text-info cursor-pointer px-1"></i>
								</span>
							</span>
						</span>
						<span v-if="field.getSearchValue">
							<div class="dropdown dropdown-hover">
								<div tabindex="0" role="button" class="p-1 pr-5" :class="{'text-info' : searchFieldIndex == fieldIndex}" @click="ToggleSearchField(fieldIndex)">
									<i class="fa-solid fa-magnifying-glass px-1" ></i>
								</div>
								<ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box" v-if="searchFieldIndex == fieldIndex">
									<Input v-model="searchValue" class="max-w-xs input-xs" placeholder="Search" inputClass="input-xs">
										<template v-slot:after><i class="fa-solid fa-magnifying-glass"></i></template>
									</Input>
								</ul>
							</div>
						</span>
					</div>
				</th>
				<th v-if="props.actions" class="select-none">
					Actions
				</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="(row, rowIndex) in currentPageRows" :key="rowIndex">
				<th v-if="props.showRowNumbers">
					{{rowIndex + 1 + pageOffsetIndex}}
				</th>
				<td v-for="(field, fleldIndex) in props.fields" :key="fleldIndex" v-html="field.render(row)" @click="HandleFieldClick(row, field)"></td>
				<td v-if="props.actions">
					<span v-for="(action, actionIndex) in actions" :key="actionIndex" v-html="action.render(row)" @click="action.onClick(row)">
					</span>
				</td>
			</tr>
		</tbody>
	</table>
	<div v-if="currentPageRows.length == 0" class="text-center mt-2"><div>No results</div></div>

	<div class="flex justify-center pt-4" v-if="props.rowsPerPage && GetPageCount() > 1">
		<div class="join">
			<template v-for="i in GetPageCount()" :key="i">
				<button class="join-item btn-xs btn" @click="pageIndex = i-1" :class="{'btn-active': i-1 == pageIndex}" v-if="PaginationIndexVisible(i-1)">{{i}}</button>
				<button class="join-item btn-xs btn btn-disabled"  v-else-if="PaginationIndexVisible(i-2)">...</button>

			</template>
		</div>
	</div>
</template>