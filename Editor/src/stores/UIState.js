import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAPIAccess } from './APIAccess.js';

const useUIState = defineStore({
	id: 'UIState',
	state: () => {
		return {
			objectModals: [],
		}
	},
	getters: {
	},
	actions: {
		OpenObjectModal(objectType, objectId){
			this.objectModals.push({
				objectType: objectType,
				objectId: objectId,
			});
		},
		CloseObjectModal(modalIndex){
			this.objectModals.splice(modalIndex,1);
		},
		OpenObjectModalCount(objectType, objectId){
			let count = 0;
			for(let modal of this.objectModals){
				if(modal.objectType == objectType && modal.objectId == objectId){
					count++;
				}
			}
			return count;
		}
	}
});
export {useUIState};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}