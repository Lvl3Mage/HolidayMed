<script setup>
	import { ref, computed } from 'vue';
	import TextInput from '@/components/FormElements/TextInput.vue';

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
		}
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
	const searchValue = ref('');
	const searchFieldIndex = ref(-1);
	function GetSearchRows(){
		if(searchFieldIndex.value == -1 || searchValue.value == ''){
			return props.rows;
		}
		return props.rows.filter(row => {
			const field = props.fields[searchFieldIndex.value];
			const value = field.getSearchValue(row);

			return value.toString().toLowerCase().includes(searchValue.value.toLowerCase());
		});
	}
	function ToggleSearchField(fieldIndex){
		if(searchFieldIndex.value == fieldIndex){
			searchFieldIndex.value = -1;
		}
		else{
			searchFieldIndex.value = fieldIndex;
		}
		searchValue.value = '';
	}


	const sortFieldIndex = ref(-1);
	const invertSort = ref(false);
	function SwitchSortField(fieldIndex){
		sortFieldIndex.value = fieldIndex;
		invertSort.value = false;
	}
	function DisableSort(){
		sortFieldIndex.value = -1;
		invertSort.value = false;
	}
	const pageIndex = ref(0);
	function SortRows(rows){
		if(sortFieldIndex.value == -1){
			return rows;
		}
		if(props.fields[sortFieldIndex.value].getSortValue == undefined){
			return rows;
		}
		return rows.slice().sort((a, b) => {
			const field = props.fields[sortFieldIndex.value];
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
	function SearchRows(rows){
		if(searchFieldIndex.value == -1 || searchValue.value == ''){
			return props.rows;
		}
		return props.rows.filter(row => {
			const field = props.fields[searchFieldIndex.value];
			const value = field.getSearchValue(row);

			return value.toString().toLowerCase().includes(searchValue.value.toLowerCase());
		});
	}
	function HandleFieldClick(row, field){
		if(field.onClick){
			field.onClick(row);
		}
	}
	function PaginationIndexVisible(index, checkNeightbours = true){
		if(props.rowsPerPage){
			if(index < 2 || index >= PageAmount()-2 || Math.abs(index - pageIndex.value) < 2){
				return true;
			}
			if(!checkNeightbours){
				return false;
			}
			return PaginationIndexVisible(index-1,false) && PaginationIndexVisible(index+1, false);
		}
		return true;
	}
	function GetPageOffset(){
		if(props.rowsPerPage){
			return pageIndex.value*props.rowsPerPage;
		}
		return 0;
	}
	const processedRows = computed(() => {
		let rows = props.rows;
		rows = SearchRows(rows);
		rows = SortRows(rows);
		return rows;
	});
	const currentPageRows = computed(() => {
		if(props.rowsPerPage){
			return processedRows.value.slice(pageIndex.value*props.rowsPerPage, (pageIndex.value+1)*props.rowsPerPage);
		}
		return processedRows.value;
	});
	const pageCount = computed(() => {
		if(!props.rowsPerPage || processedRows.value.length == 0){
			return 1;
		}
		return Math.ceil(processedRows.value.length/props.rowsPerPage);
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
									<TextInput v-model="searchValue" class="max-w-xs input-xs" placeholder="Search" inputClass="input-xs">
										<template v-slot:after><i class="fa-solid fa-magnifying-glass"></i></template>
									</TextInput>
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
					{{rowIndex + 1 + GetPageOffset()}}
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

	<div class="flex justify-center pt-4" v-if="props.rowsPerPage && pageCount > 1">
		<div class="join">
			<template v-for="i in pageCount" :key="i">
				<button class="join-item btn-xs btn" @click="pageIndex = i-1" :class="{'btn-active': i-1 == pageIndex}" v-if="PaginationIndexVisible(i-1)">{{i}}</button>
				<button class="join-item btn-xs btn btn-disabled"  v-else-if="PaginationIndexVisible(i-2)">...</button>

			</template>
		</div>
	</div>
</template>