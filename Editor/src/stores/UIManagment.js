import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAPIAccess } from '@/stores/APIAccess.js';

const useUIManagment = defineStore({
	id: 'UIManagment',
	state: () => {
		return {
			objectModals: [],
			toasts: [],
			_elementIndexer: 0,
		}
	},
	getters: {
		uniqueElementIndex(){
			return this._elementIndexer++;
		}
	},
	actions: {
		CreateModalPromise(){
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
			return {modalPromise, modalResolve, modalReject};
		},
		OpenEditObjectModal(objectType, objectId){
			let promiseData = this.CreateModalPromise();
			this.objectModals.push({
				modalType: "Edit",
				modalProps: {
					objectType: objectType,
					objectId: objectId,
				},
				resolve: promiseData.modalResolve,
				reject: promiseData.modalReject,
				uniqueId: this.uniqueElementIndex,
			});
			return promiseData.modalPromise;
		},
		OpenCreateObjectModal(objectType){
			let promiseData = this.CreateModalPromise();
			this.objectModals.push({
				modalType: "Create",
				modalProps: {
					objectType: objectType,
				},
				resolve: promiseData.modalResolve,
				reject: promiseData.modalReject,
				uniqueId: this.uniqueElementIndex,
			});
			return promiseData.modalPromise;
		},
		GetModalByUniqueId(uniqueId){
			return this.objectModals.find((modal) => modal.uniqueId == uniqueId);
		},
		OpenToast(attrs = {}){
			const RemoveToastWithUniqueID = function (uniqueId){
				let index = this.toasts.findIndex((toast) => toast.uniqueId == uniqueId);
				if(index != -1){
					this.toasts.splice(index, 1);
				}
			}.bind(this);

			const toast = {
				attrs: attrs,
				closePromiseTask: function(){
						return new Promise((resolve) => {
						console.warn("Close promise task not implemented.");
						resolve();
					});
				},
				CloseToast: function(){
					this.closePromiseTask().then(() => {
						RemoveToastWithUniqueID(this.uniqueId);
					})
					.catch((err) => {
						console.error("Error while closing toast: ", err);
					});
				},
				uniqueId: this.uniqueElementIndex,
			};
			this.toasts.push(toast);
			return toast;
		},

		
	}
});
export {useUIManagment};