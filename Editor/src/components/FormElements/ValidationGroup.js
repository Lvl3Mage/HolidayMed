import {ref, computed, watch, shallowReactive, reactive} from "vue";

export function useValidationGroup(){
	const elements = shallowReactive({});
	watch(elements, (newVal) => {
			for(let key of Object.keys(newVal)){
				if(newVal[key] === null){
					delete newVal[key];
				}
			}
		},
		{ flush: 'sync' }
	);
	function isValid(){
		return Object.keys(elements).every(inputKey => elements[inputKey].valid);
	}
	return {elements, isValid};
}