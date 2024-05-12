import {ref, computed, watch, shallowReactive, reactive} from "vue";

export function useObjectData(data,globalProcessor){
	const objectData = reactive(data);
	watch(objectData, globalProcessor,
		{ flush: 'sync' }
	);
	globalProcessor(objectData);
	return objectData;
}