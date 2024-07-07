<script setup>
import {computed, ref} from "vue";

const emit = defineEmits(['change'])
const props = defineProps({
	items: {
		type: Array,
		required: true,
	},
	itemsPerPage: {
		type: Number,
		required: false,
		default: 25,
	},
});
const pageIndex = ref(0);
const currentPageItems = computed(() => {
	return props.items.slice(
		pageIndex.value * props.itemsPerPage,
		(pageIndex.value + 1) * props.itemsPerPage,
	);
});

function SetPageIndex(newIndex) {
	pageIndex.value = newIndex;
	emit("change", newIndex);
}

function PaginationIndexVisible(index, checkNeighbors = true) {
	if (props.itemsPerPage) {
		if (index < 2 || index >= GetPageCount() - 2 || Math.abs(index - pageIndex.value) < 2) {
			return true;
		}
		if (!checkNeighbors) {
			return false;
		}
		return PaginationIndexVisible(index - 1, false) && PaginationIndexVisible(index + 1, false);
	}
	return true;
}

function GetPageCount() {
	if (!props.itemsPerPage || props.items.length === 0) {
		return 1;
	}
	return Math.ceil(props.items.length / props.itemsPerPage);
}
defineExpose({
	GetPageCount,
	SetPageIndex,
});
</script>

<template>
	<slot :items="currentPageItems" :index="pageIndex"></slot>
	
	<div class="flex justify-center pt-4" v-if="GetPageCount() > 1">
		<div class="join">
			<template v-for="i in GetPageCount()" :key="i">
				<button class="join-item btn-xs btn" @click="SetPageIndex(i-1)"
				        :class="{'btn-active': i-1 === pageIndex}" v-if="PaginationIndexVisible(i-1)">{{ i }}
				</button>
				<button class="join-item btn-xs btn btn-disabled" v-else-if="PaginationIndexVisible(i-2)">...
				</button>

			</template>
		</div>
	</div>
</template>

<style scoped lang="scss">

</style>