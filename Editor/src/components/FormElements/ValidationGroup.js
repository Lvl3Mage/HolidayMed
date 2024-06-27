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

	/**
	 * 
	 * @returns {boolean} Validity of all elements in the group
	 */
	function isValid(){
		return Object.keys(elements).every(inputKey => elements[inputKey].valid);
	}

	/**
	 * @description Add an element to the group
	 * @param element - Element to add to the group
	 * @param {string} key - Optional key to use for the element, if not provided element must have a uniqueId property
	 * @constructor
	 */
	function Add(element, key){
		
		if (key === undefined){
			throw new Error("Key must be provided");
		}
		// cannot use uniqueId property of element because the element cannot be nullified since the uniqueId property is no longer available
		// if(key === null){
		// 	if (element.uniqueId === undefined){
		// 		throw new Error("Element must have a uniqueId property");
		// 	}
		// 	key = element.uniqueId;
		// }
		elements[key] = element;
	}
	return {elements, isValid, Add};
}