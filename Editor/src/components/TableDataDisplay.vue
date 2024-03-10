<script setup>
	import { ref, computed } from 'vue'

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
			displayName: "id",
			render: (object) => object.id,
			onClick: (object) => console.log(object)
		}
	]*/
	const pageIndex = ref(0);
	function GetCurrentRows(){
		if(props.rowsPerPage){
			return props.rows.slice(pageIndex.value*props.rowsPerPage, (pageIndex.value+1)*props.rowsPerPage);
		}
		return props.rows;
	}
	function HandleClick(row, field){
		if(field.onClick){
			field.onClick(row);
		}
	}
	function PageAmount(){
		if(!props.rowsPerPage || props.rows.length == 0){
			return 1;
		}

		return Math.ceil(props.rows.length/props.rowsPerPage);
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

</script>
<template>
	<table class="table" :class="{'table-xs' : props.compact}">
		<thead>
			<tr>
				<th v-for="(field, index) in props.fields" :key="index">
					{{field.displayName}}
				</th>
				<th v-if="props.actions">
					Actions
				</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="(row, rowIndex) in GetCurrentRows()" :key="rowIndex">
				<th v-if="props.showRowNumbers">
					{{rowIndex + 1 + GetPageOffset()}}
				</th>
				<td v-for="(field, fleldIndex) in props.fields" :key="fleldIndex" v-html="field.render(row)" @click="HandleClick(row, field)"></td>
				<td v-if="props.actions">
					<span v-for="(action, actionIndex) in actions" :key="actionIndex" v-html="action.render(row)" @click="action.onClick(row)">
					</span>
				</td>
			</tr>
		</tbody>
	</table>

	<div class="flex justify-center pt-4" v-if="props.rowsPerPage && PageAmount() > 1">
		<div class="join">
			<template v-for="i in (PageAmount())" :key="i">
				<button class="join-item btn-xs btn" @click="pageIndex = i-1" :class="{'btn-active': i-1 == pageIndex}" v-if="PaginationIndexVisible(i-1)">{{i}}</button>
				<button class="join-item btn-xs btn btn-disabled"  v-else-if="PaginationIndexVisible(i-2)">...</button>

			</template>
		</div>
	</div>
</template>