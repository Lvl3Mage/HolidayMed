<script setup>
import {useObjectCache} from "@/stores/ObjectCache";

const ObjectCache = useObjectCache();
import {computed, reactive, ref} from "vue";
import DateRangeCalendar from "@/components/DateRangeCalendar.vue";
import TableDataDisplay from "@/components/TableDataDisplay.vue";
import {DateRangeIntersect} from "@/DateUtils";
import {ParseYMDString} from "@/Utils";
import {useUIManagement} from "@/stores/UIManagment";
const UIManagement = useUIManagement();

const displayedMonth = ref(new Date());
const blockedRanges = computed(() => {
	return ObjectCache.GetSegmentRows("reservation").map((reservation) => {
		return {
			startDate: reservation.acf.start_date,
			endDate: reservation.acf.end_date,
			acf: reservation.acf,
		};
	});
});
const calendar = ref(null);
const selectedReservations = computed(() => {
	const selectionRange = calendar.value?.GetSelectionRange();
	if (!selectionRange) {
		return [];
	}
	if (selectionRange[0] === null || selectionRange[1] === null) {
		return [];
	}
	console.log("Recalculating selected reservations");
	return ObjectCache.GetSegmentRows("reservation").filter((reservation) => {
		return DateRangeIntersect(ParseYMDString(reservation.acf.start_date), ParseYMDString(reservation.acf.end_date), selectionRange[0], selectionRange[1]);
	});
});
</script>

<template>
	<div class="container">
		<DateRangeCalendar ref="calendar" class="w-full m-auto max-w-md"
		                   v-model:displayed-month="displayedMonth"
		                   :blocked-ranges="blockedRanges"></DateRangeCalendar>
		<div class="divider"></div>
		<div class="flex justify-start gap-2 items-center">
			<div class="text-sm">
				Selection:
			</div>
			<div class="badge badge-info">{{calendar?.GetSelectionRange()[0]?.toDateString()}}</div>
			<div class="">-</div>
			<div class="badge badge-info">{{calendar?.GetSelectionRange()[1]?.toDateString()}}</div>
		</div>
		<div class="divider">Reservations</div>
		<TableDataDisplay :actions="[
			{
				render(){
					return `<div class='btn btn-accent btn-xs'>Edit</div>`;
				},
				onClick(row){
					UIManagement.OpenEditObjectModal(`reservation`, row.id);
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
</template>

<style lang="css">
</style>