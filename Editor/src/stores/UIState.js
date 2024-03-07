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
			let modalResolve;
			let modalReject;
			let modalIndex = this.objectModals.length;
			let modalPromise = new Promise((resolve, reject) => {
				modalResolve = function(code='', data=null){
					if(modalIndex+1 != this.objectModals.length){
						console.warn("Cannot resolve modal since it's not the last one opened.");
						return;
					}
					this.objectModals.pop();
					resolve({
						code: code,
						data: data
					});
				}.bind(this);
				modalReject = function(code='', data=null){
					if(modalIndex+1 != this.objectModals.length){
						console.warn("Cannot reject modal since it's not the last one opened.");
						return;
					}
					this.objectModals.pop();
					reject({
						code: code,
						data: data
					});
				}.bind(this);
			});


			this.objectModals.push({
				objectType: objectType,
				objectId: objectId,
				resolve: modalResolve,
				reject: modalReject,
			});
			return modalPromise;
		},
	}
});
export {useUIState};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}