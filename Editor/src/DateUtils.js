export function WithoutTime(date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
export function SameDay(date1, date2) {
	if (date1 === null || date2 === null) {
		return false;
	}
	if (date1 === undefined || date2 === undefined) {
		return false;
	}
	return SameMonth(date1, date2) && date1.getDate() === date2.getDate();
}

export function SameMonth(date1, date2) {
	if (date1 === null || date2 === null) {
		return false;
	}
	if (date1 === undefined || date2 === undefined) {
		return false;
	}
	return SameYear(date1, date2) && date1.getMonth() === date2.getMonth();
}

export function SameYear(date1, date2) {
	if (date1 === null || date2 === null) {
		return false;
	}
	if (date1 === undefined || date2 === undefined) {
		return false;
	}
	return date1.getFullYear() === date2.getFullYear();
}


export function InRange(date, start, end) {
	// this is a little weird but it makes sure that even if the range is incomplete (one side is null), it still returns true on same day
	return SameDay(date, start) || SameDay(date, end) || date > start && date < end;
}

export function DateRangeIntersect(start1, end1, start2, end2) {
	if (start1 === null || end1 === null || start2 === null || end2 === null) {
		return false;
	}
	return InRange(start1, start2, end2) || InRange(end1, start2, end2) || InRange(start2, start1, end1) || InRange(end2, start1, end1);
	
}