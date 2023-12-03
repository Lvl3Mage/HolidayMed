import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {useAPIAccess} from './APIAccess.js';

let aprtData = {
	id: "HM034",
	name: "apName",
	// .. more fields go here
}
const useObjectManager = defineStore({
	id: 'ObjectManager',
	state: () => {
		let types = ["apartment"];
		let managedObjects = {};
		for(type of types){
			managedObjects[type] = {};
		}
		return {
			apiAcess: useAPIAccess(),
			types: types,
			managedObjects: managedObjects,
		};
	},
	getters: {
	},
	actions: {
		GetObject(objectType, objectID){
			if(!(objectType in this.managedObjects)){
				return null;
			}
			if((objectID in this.managedObjects[objectType])){
				return null;
			}
			return this.managedObjects[objectType][objectID];
		},
		CreateEmptyObject(objectType, objectID, editMode){
			this.managedObjects[objectType][objectID] = {id:objectID, type:objectType, editMode: editMode, loaded: false};
		},


		ReserveObject(objectType, objectID){
			// request token
				//on sucess set token and reserve apartment again with a delay
				//of failiure show error in notifs and call close object 
		},
		RequestObjectData(objectType, objectID){
			//request apartment data
				//on sucess set apartment data
				//of failiure show error in notifs and call close object 
		},
		//public methods
		CloseObject(objectType, objectID){
			delete this.managedObjects[objectType][objectID];
		},
		StoreObject(objectType, objectID, callback){
			let object = this.GetObject(objectType,objectID);
			if(object == null){
				console.error(`Object of type ${object} and id ${objectID} is not open!`);
				return; 
			}
			if(!object.editMode){
				console.error("Can only store objects that are in edit mode!");
				return;
			}
			//request to store apartment with token
				//call callback
		},
		OpenObject(objectType, objectID, editMode = false){
			if(this.GetObject(objectType,objectID) != null){
				console.warn(`Object of type ${object} and id ${objectID} is already open!`)
				return;
			}

			this.CreateEmptyObject(objectType,objectID);

			RequestObjectData(objectType, objectID);

			if(editMode){
				ReserveObject(objectType, objectID);
			}

		},
		ObjectOpen(objectType, objectID){
			let object = this.GetObject(objectType,objectID);
			return object == null;
		},
		ObjectLoaded(objectType, objectID){
			let object = this.GetObject(objectType,objectID);
			if(object == null){
				console.warn(`Object of type ${object} and id ${objectID} has not been requested and thus will not be loaded!`);
				return false; 
			}
			return object.loaded;
		},
		ReadObject(objectType, objectID){
			return this.GetObject(objectType, objectID);
		}

	}
});
export {useApartments};