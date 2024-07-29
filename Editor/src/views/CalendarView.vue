<script setup>
import {useObjectCache} from "@/stores/ObjectCache";

const ObjectCache = useObjectCache();
import {computed, ref} from "vue";
import {ParseYMDString} from "@/Utils";

const currentMonth = ref(new Date());

function MoveCurrentMonth(amount) {
	currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + amount, 1);
}

const months_EN = ref([
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
]);
const weekDays_EN = ref(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
const days = computed(() => {
	const days = {};
	const reservationData = ObjectCache.GetSegmentRows("reservation");
	for (const reservation of reservationData) {
		const reservationStart = ParseYMDString(reservation.acf.start_date);
		const reservationEnd = ParseYMDString(reservation.acf.end_date);
		console.log(reservation);
		for (let day = reservationStart; day <= reservationEnd; day.setDate(day.getDate() + 1)) {
			if (days[day.toDateString()] === undefined) {
				days[day.toDateString()] = {
					reservations: [],
					date: day,
				};
			}
			days[day.toDateString()].reservations.push(reservation);
		}
	}
	return days;
});

function GetDay(date) {
	const day = days[date.toDateString()];
	if (day === undefined) {
		return {
			reservations: [],
			date: date,
		};
	}
	return day;
}

function SameDay(date1, date2) {
	return SameMonth(date1, date2) && date1.getDate() === date2.getDate();
}

function SameMonth(date1, date2) {
	return SameYear(date1, date2) && date1.getMonth() === date2.getMonth();
}

function SameYear(date1, date2) {
	return date1.getFullYear() === date2.getFullYear();
}

console.log(days.value);
const displayedRows = computed(() => {
	const rows = [];
	for (let weekOffset = 0; weekOffset < 5; weekOffset++) {
		const row = [];
		for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
			row.push(GetDay(new Date(
				currentMonth.value.getFullYear(),
				currentMonth.value.getMonth(),
				1 + (weekOffset * 7) + dayOffset,
			)));
		}
		rows.push(row);
	}
	return rows;
});
</script>

<template>
	<div class="container h-full">
		<div class="min-h-full rounded overflow-hidden border-base-300 border flex-col">
			<div class="flex border-b border-base-300 last:border-0">
				<div class="border-r border-base-300 last:border-0 basis-[calc(100%/7)] p-1 opacity-60"
				     v-for="day of weekDays_EN">
					{{ day }}
				</div>
			</div>
			<div class="flex border-b border-base-300 last:border-0" v-for="week of displayedRows">
				<div v-for="day of week"
				     class="min-h-24 border-r border-base-300 last:border-0 basis-[calc(100%/7)]
							[&.disabled]:bg-base-200 p-1"
				     :class="{'disabled':!SameMonth(day.date, currentMonth)}">
					<div class="[.disabled_&]:opacity-60">
						<div class="opacity-60">
							{{ day.date.getDate() }}
						</div>
						<div class="text-xs flex justify-center">
<!--													<button class="btn btn-info btn-xs">Ver reservas</button>-->
						</div>

					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">

</style>