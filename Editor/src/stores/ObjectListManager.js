import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {useAPIAccess} from './APIAccess.js';

const useObjectListManager = defineStore({
	id: 'ObjectListManager',
	state: () => {
		let types = ["apartment", "group", "reservation", "house"];//MOVE TO GENERAL CONFIG
		let managedObjects = {};
		for(let type of types){
			managedObjects[type] = {};
		}
		return {
			APIAccess: useAPIAccess(),
			types: types,//MOVE TO GENERAL CONFIG
			managedObjects: managedObjects,
			typeRequestLookup: { //MOVE TO GENERAL CONFIG
				"apartment": "/apartments",
				"group": "/groups",
				"reservation": "/reservations",
				"house": "/houses"
			},
		};
	},
	getters: {
	},
	actions: {
		ReloadObjectsOfType(objectType){
			let requestPath = this.typeRequestLookup[objectType];
			this.APIAccess.RequestREST(requestPath)
			.then(function (response) {
				// handle success
				this.ProcessObjectData(objectType, response.data);
			}.bind(this))
			.catch(function (error) {
				// handle error
				console.error(error);
			}.bind(this));
		},
		ProcessObjectData(objectType,objectData){
			let newObjects = {};
			for(let data of objectData){
				newObjects[data.id] = this.ObjectFromData(data);
			}
			this.managedObjects[objectType] = newObjects;
		},
		ObjectFromData(objectType, objectData){
			return {
				data: objectData,
			};
		},
		GetObject(objectType, objectId){
			if(!(objectId in this.managedObjects[objectType])){
				return null;
			}
			return this.managedObjects[objectType][objectId];
		},
		UpdateObjectFromData(objectType, data){
			this.managedObjects[objectType][data.id] = this.ObjectFromData(data);
		}
	}
});
export {useObjectListManager};