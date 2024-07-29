<script setup>
import {useObjectCache} from "@/stores/ObjectCache";

const ObjectCache = useObjectCache();
import {computed, reactive, ref} from "vue";
import {ParseYMDString} from "@/Utils";

const currentMonth = ref(new Date());
SetCurrentMonth(new Date());
function SetCurrentMonth(date) {
	currentMonth.value = new Date(date.getFullYear(), date.getMonth(), 1);
}


function WithOffsetMonth(date, monthOffset) {
	console.log(date, "with offset");
	return new Date(date.getFullYear(), date.getMonth() + monthOffset, date.getDate());
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
	const reservedDays = {};
	const reservationData = ObjectCache.GetSegmentRows("reservation");
	for (const reservation of reservationData) {
		const reservationStart = ParseYMDString(reservation.acf.start_date);
		const reservationEnd = ParseYMDString(reservation.acf.end_date);
		let day = reservationStart;
		while (day <= reservationEnd) {
			if (reservedDays[day.toDateString()] === undefined) {
				reservedDays[day.toDateString()] = {
					reservations: [],
					date: day,
				};
			}
			reservedDays[day.toDateString()].reservations.push({
				startDate: ParseYMDString(reservation.acf.start_date),
				endDate: ParseYMDString(reservation.acf.end_date),
				id: reservation.id,
				order: reservation.acf.order,
				apartment: reservation.acf.apartment,
			});
			day = DateWithDayOffset(day, 1);
		}
	}
	return reservedDays;
});

function GetDay(date) {
	const day = days.value[date.toDateString()];
	if (day === undefined) {
		return {
			reservations: [],
			date: date,
		};
	}
	return day;
}

function SameDay(date1, date2) {
	if (date1 === null || date2 === null) {
		return false;
	}
	if (date1 === undefined || date2 === undefined) {
		return false;
	}
	return SameMonth(date1, date2) && date1.getDate() === date2.getDate();
}

function SameMonth(date1, date2) {
	if (date1 === null || date2 === null) {
		return false;
	}
	if (date1 === undefined || date2 === undefined) {
		return false;
	}
	return SameYear(date1, date2) && date1.getMonth() === date2.getMonth();
}

function SameYear(date1, date2) {
	if (date1 === null || date2 === null) {
		return false;
	}
	if (date1 === undefined || date2 === undefined) {
		return false;
	}
	return date1.getFullYear() === date2.getFullYear();
}

function BetweenDates(date, startDate, endDate) {
	// this is a little weird but it makes sure that even if the range is incomplete (one side is null), it still returns true on same day
	return SameDay(date, startDate) || SameDay(date, endDate) || date > startDate && date < endDate;
}

function DateWithDayOffset(date, dayOffset) {
	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate() + dayOffset,
	);
}

const displayedDays = computed(() => {
	const elems = [];

	//Making week start at monday
	let startDay = (currentMonth.value.getDay() - 1);
	if (startDay < 0) {
		startDay = 6;
	}

	for (let dayOffset = -startDay; dayOffset < 7 * 5 - startDay; dayOffset++) {
		elems.push(GetDay(DateWithDayOffset(currentMonth.value, dayOffset)));
	}
	return elems;
});

function IsReservationEnd(day) {
	if (day.reservations.length === 0) {
		return false;
	}
	return day.reservations.every((reservation) => {
		return SameDay(reservation.endDate, day.date);
	});
}

function IsReservationStart(day) {
	if (day.reservations.length === 0) {
		return false;
	}
	return day.reservations.every((reservation) => {
		return SameDay(reservation.startDate, day.date);
	});
}
function IsReservationSingle(day) {
	if (day.reservations.length === 0) {
		return false;
	}
	return day.reservations.some((reservation) => {
		return SameDay(reservation.startDate, day.date) && SameDay(reservation.endDate, day.date);
	});
}

const selectionBuffer = ref([]);

function GetRangeFromBuffer(buffer) {
	if (buffer.length === 0) {
		return [null, null];
	}
	if (buffer.length === 1) {
		return [buffer[0], buffer[0]];
	}
	return buffer.sort((a, b) => a - b);
}

const selection = reactive({
	GetRange() {
		const buffer = [...selectionBuffer.value];
		if (buffer.length <= 1) {
			if (hoveredDate.value !== null) {
			buffer.push(hoveredDate.value);
			}
		}
		return GetRangeFromBuffer(buffer);
	},
	Add(date) {
		if (selectionBuffer.value.length <= 1) {
			selectionBuffer.value.push(date);
		}
		else {
			selectionBuffer.value = [date];
		}
	},
	Reset() {
		selectionBuffer.value = [];
	},
	IsComplete() {
		return selectionBuffer.value.length === 2;
	},
});
const hoveredDate = ref(null);

function DisplayAsSelected(date) {
	const range = selection.GetRange();
	if (range.length === 1) {
		return SameDay(date, range[0]);
	}
	return BetweenDates(date, range[0], range[1]);
}

function ProcessSelection(date) {
	if (!selection.IsComplete()) {
		selection.Add(date);
		return;
	}
	if (DisplayAsSelected(date)) {
		selection.Reset();
		return;
	}
	selection.Add(date);
}
</script>

<template>
	<div class="container h-full">
		
		<div class="text-2xl font-bold text-center mb-2">
			{{ months_EN[currentMonth.getMonth()] }} - {{ currentMonth.getFullYear() }}
			
		</div>
		
		<div class="rounded overflow-hidden border-base-300 border flex-col">
			<div class="grid grid-cols-7 auto-rows-auto bg-base-300 gap-[1px]">
				<div class="bg-base-100 p-1"
				     v-for="day of weekDays_EN">
					<div class="opacity-60">
						{{ day }}
					</div>
				</div>
				<div v-for="(day, index) of displayedDays"
				     class="bg-base-100 aspect-square group/day 
							[&.disabled]:bg-base-200
							cursor-pointer relative"
				     :class="{
						'disabled':!SameMonth(day.date, currentMonth),
				        'reserved-full':day.reservations.length > 0 && !IsReservationEnd(day) && !IsReservationStart(day),
				        'reserved-end': IsReservationEnd(day) && !IsReservationStart(day),
				        'reserved-start': IsReservationStart(day) && !IsReservationEnd(day),
				        'reserved-single': IsReservationEnd(day) && IsReservationStart(day),
				        'selected':DisplayAsSelected(day.date),
				        'selected-start':SameDay(day.date, selection.GetRange()[0]),
				        'selected-end':SameDay(day.date, selection.GetRange()[1]),
				        'today':SameDay(day.date, new Date()),
				        'hovered-in-selection': BetweenDates(hoveredDate, selection.GetRange()[0], selection.GetRange()[1]) && selection.IsComplete(),
				        'hovered': SameDay(day.date, hoveredDate),
				     }"
				     @click="ProcessSelection(day.date)"
				     @mouseover="hoveredDate = day.date"
				     @mouseleave="hoveredDate = null">
					<!--					<div class="transition-all z-0 absolute inset-0 rounded-0 -->
					<!--						opacity-0 group-[&.selected]/day:opacity-100 bg-info/60 border-t-4 border-b-4 border-info/20 -->
					<!--						group-[&.selected-start]/day:rounded-l-2xl group-[&.selected-start]/day:border-l-4 -->
					<!--						group-[&.selected-end]/day:rounded-r-2xl group-[&.selected-end]/day:border-r-4 -->
					<!--						 ">-->
					<!--					</div>-->
					<div class="transition-all z-0 absolute inset-0 rounded-0 
						group-[&.selected]/day:bg-info/60
						
						group-[&.hovered-in-selection.selected]/day:bg-info/40
						group-[&.hovered:not(.selected)]/day:bg-info/20
						
						group-[&.selected-start]/day:rounded-l-2xl
						group-[&.selected-end]/day:rounded-r-2xl
						
						">
					</div>

					<div class=" flex flex-col h-full relative z-10">
						<div class="p-1 group-[&.disabled]/day:opacity-60">
							<span
								class="group-[&.today]/day:bg-accent rounded-full p-1 w-6 h-6 text-xs flex justify-center items-center">
								<span class="opacity-60">
									{{ day.date.getDate() }}
									
								</span>
							</span>
						</div>
						<div class="grow flex justify-center items-center">
							<div class="relative w-full h-1/3">
								<div class=" h-full w-full flex gap-1 justify-center">
									<div class="
										transition-all h-full basis-0 hidden grow-[4]
										group-[&.reserved-full]/day:block
										bg-error/60
									">
									</div>
									<div class="
										transition-all h-full rounded-r-full hidden grow max-w-[70%] mr-auto
										group-[&.reserved-end]/day:block
										bg-error/60
									">
									</div>
									<div class="
										transition-all h-full rounded-full hidden grow-[2] max-w-[70%] mx-1
										group-[&.reserved-single]/day:block
										bg-error/60
									">
									</div>
									<div class="
										transition-all h-full rounded-l-full hidden grow max-w-[70%] ml-auto
										group-[&.reserved-start]/day:block
										bg-error/60
									">
									</div>

								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="flex justify-between items-center gap-4 mt-2">
			<div class="btn" @click="SetCurrentMonth(WithOffsetMonth(currentMonth,-1))">
				{{ months_EN[WithOffsetMonth(currentMonth,-1).getMonth()] }} - {{ WithOffsetMonth(currentMonth,-1).getFullYear() }}
			</div>
			<div class="btn" @click="SetCurrentMonth(WithOffsetMonth(currentMonth,1))">
				{{ months_EN[WithOffsetMonth(currentMonth,1).getMonth()] }} - {{ WithOffsetMonth(currentMonth,1).getFullYear() }}
			</div>
			
		</div>
	</div>
</template>

<style lang="css">
</style>