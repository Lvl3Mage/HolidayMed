<script setup>
import {useObjectCache} from "@/stores/ObjectCache";

const ObjectCache = useObjectCache();
import {computed, reactive, ref, watch} from "vue";
import {ParseYMDString} from "@/Utils";
import {InRange, SameDay, SameMonth} from "@/DateUtils";


const props = defineProps({
	blockedRanges: {
		type: Array,
		required: false,
		default: [],
	},
	disabledRanges: {
		type: Array,
		required: false,
		default: [],
	},
});

const displayedMonth = defineModel("displayedMonth", {
	type: Date,
	required: false,
	default: new Date(),
	get(value) {
		return new Date(value.getFullYear(), value.getMonth(), 1);
	},
});
function SetCurrentMonth(date) {
	displayedMonth.value = new Date(date.getFullYear(), date.getMonth(), 1);
}


function WithOffsetMonth(date, monthOffset) {
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
	console.log("Recalculating days");
	const blockedDays = {};
	if (props.blockedRanges !== undefined) {
		for (const blockRange of props.blockedRanges) {
			const colorClass = blockRange.colorClass ?? "bg-error/60";
			const reservationStart = ParseYMDString(blockRange.startDate);
			const reservationEnd = ParseYMDString(blockRange.endDate);
			let day = reservationStart;
			while (day <= reservationEnd) {
				if (blockedDays[day.toDateString()] === undefined) {
					blockedDays[day.toDateString()] = CreateDay(day);
				}
				const newBlock = {
					startDate: ParseYMDString(blockRange.startDate),
					endDate: ParseYMDString(blockRange.endDate),
					blockRangeData: blockRange,
				};
				blockedDays[day.toDateString()].blockRanges.push(newBlock);
				blockedDays[day.toDateString()].colorClass = colorClass;
				if (IsBlockStart(day, newBlock)) {
					blockedDays[day.toDateString()].blockTypes.start = true;
				}
				if (IsBlockEnd(day, newBlock)) {
					blockedDays[day.toDateString()].blockTypes.end = true;
				}
				if (IsBlockSingle(day, newBlock)) {
					blockedDays[day.toDateString()].blockTypes.single = true;
				}
				if (IsBlockFull(day, newBlock)) {
					blockedDays[day.toDateString()].blockTypes.full = true;
				}
				day = DateWithDayOffset(day, 1);
			}
		}
		
	}
	if (props.disabledRanges !== undefined) {
		for (const blockRange of props.disabledRanges) {
			const start = ParseYMDString(blockRange.startDate);
			const end = ParseYMDString(blockRange.endDate);
			let day = start;
			while (day <= end) {
				if (blockedDays[day.toDateString()] === undefined) {
					blockedDays[day.toDateString()] = CreateDay(day);
				}
				blockedDays[day.toDateString()].disabled = true;
				day = DateWithDayOffset(day, 1);
			}
		}
	}
	return blockedDays;
});
function CreateDay(date) {
	return {
		blockRanges: [],
		blockTypes:{
			full: false,
			start: false,
			end: false,
			single: false,
		},
		disabled: false,
		date: date,
		colorClass: "bg-error/60",
	};
}
function GetDay(date) {
	const day = days.value[date.toDateString()];
	if (day === undefined) {
		return CreateDay(date);
	}
	return day;
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
	let startDay = (displayedMonth.value.getDay() - 1);
	if (startDay < 0) {
		startDay = 6;
	}

	for (let dayOffset = -startDay; dayOffset < 7 * 5 - startDay; dayOffset++) {
		elems.push(GetDay(DateWithDayOffset(displayedMonth.value, dayOffset)));
	}
	return elems;
});

function IsBlockEnd(date, blockRange) {
	return SameDay(blockRange.endDate, date);
}

function IsBlockStart(date, blockRange) {
	return SameDay(blockRange.startDate, date);
}
function IsBlockSingle(date, blockRange) {
	return IsBlockEnd(date, blockRange) && IsBlockStart(date, blockRange);
}
function IsBlockFull(date, blockRange) {
	
	return !SameDay(blockRange.startDate, date) && !SameDay(blockRange.endDate, date);
}
const selectionBuffer = defineModel('selectionBuffer', {
	type: Array,
	required: false,
	default: [],
});

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
		if (date === null || date === undefined) {
			return;
		}
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
	return InRange(date, range[0], range[1]);
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

defineExpose({
	GetSelectionRange() {
		return selection.GetRange();
	},
});



</script>

<template>
	<div>
		
		<div class="text-2xl font-bold text-center mb-2">
			{{ months_EN[displayedMonth.getMonth()] }} - {{ displayedMonth.getFullYear() }}

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
							[&.outside-month]:bg-base-200
							[&.disabled]:bg-base-300
							cursor-pointer relative"
				     :class="{
						'disabled': day.disabled,
						'outside-month':!SameMonth(day.date, displayedMonth) && !day.disabled,
				        'reserved-full': day.blockTypes.full,
				        'reserved-end': day.blockTypes.end && !day.blockTypes.full && !day.blockTypes.single,
				        'reserved-start': day.blockTypes.start && !day.blockTypes.full && !day.blockTypes.single,
				        'reserved-single': day.blockTypes.single && !day.blockTypes.full,
				        'selected':DisplayAsSelected(day.date),
				        'selected-start':SameDay(day.date, selection.GetRange()[0]),
				        'selected-end':SameDay(day.date, selection.GetRange()[1]),
				        'today':SameDay(day.date, new Date()),
				        'hovered-in-selection': InRange(hoveredDate, selection.GetRange()[0], selection.GetRange()[1]) && selection.IsComplete(),
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
						<div class="p-1 group-[&.outside-month]/day:opacity-60">
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
									"
									:class="[day.colorClass]">
									</div>
									<div class="
										transition-all h-full rounded-r-full hidden grow max-w-[70%] mr-auto
										group-[&.reserved-end]/day:block
									"
									:class="[day.colorClass]">
									</div>
									<div class="
										transition-all h-full rounded-full hidden grow-[2] max-w-[70%] mx-1
										group-[&.reserved-single]/day:block
									"
									:class="[day.colorClass]">
									</div>
									<div class="
										transition-all h-full rounded-l-full hidden grow max-w-[70%] ml-auto
										group-[&.reserved-start]/day:block
									"
									:class="[day.colorClass]">
									</div>

								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="flex justify-between items-center gap-4 mt-2">
			<div class="btn" @click="SetCurrentMonth(WithOffsetMonth(displayedMonth,-1))">
				{{ months_EN[WithOffsetMonth(displayedMonth, -1).getMonth()] }} - {{
					WithOffsetMonth(
						displayedMonth,
						-1
					).getFullYear()
				}}
			</div>
			<div class="btn" @click="SetCurrentMonth(WithOffsetMonth(displayedMonth,1))">
				{{ months_EN[WithOffsetMonth(displayedMonth, 1).getMonth()] }} - {{
					WithOffsetMonth(
						displayedMonth,
						1
					).getFullYear()
				}}
			</div>
			
		</div>
	</div>
</template>