import {ref, computed, watch, shallowReactive, reactive} from "vue";

export function useObjectData(data,globalProcessor){
	const objectData = reactive(data);
	watch(objectData, globalProcessor, 
		{ flush: 'sync'} //Causes infinite recursion when hot reload is enabled, but seems to work fine without it
	);
	globalProcessor(objectData);
	return objectData;
}