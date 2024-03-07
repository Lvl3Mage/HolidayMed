import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {useAPIAccess} from './APIAccess.js';

let exampleObjectData = {
	name: "OBJECT_NAME",
	// .. more fields go here
};
let exampleObjectToken = "OBJECT_TOKEN";
const useObjectManager = defineStore({
	id: 'ObjectManager',
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
		};
	},
	getters: {
		// OpenObjects(){
		// 	for(let objectType of managedObjects.keys()){

		// 	}
		// }
	},
	actions: {
		GetObject(objectType, objectID){
			if(!(objectType in this.managedObjects)){
				return null;
			}
			if(!(objectID in this.managedObjects[objectType])){
				return null;
			}
			return this.managedObjects[objectType][objectID];
		},
		CreateEmptyObject(objectType, objectID, editMode){
			this.managedObjects[objectType][objectID] = {id:objectID, type:objectType, editMode: editMode, dataLoaded: false, reserved: false};
		},


		async ReserveObject(objectType, objectID){
			await sleep(400);
			let obj = this.GetObject(objectType,objectID);
			if(obj == null){
				console.error(`Object ${objectID} of type ${objectType} not found!`);
				return;
			}
			obj.token = exampleObjectToken;
			obj.reserved = true;
			// request token
				//on sucess set token and reserve apartment again with a delay
				//of failiure show error in notifs and call close object 
		},
		RequestObjectData(objectType, objectID){
			this.APIAccess.GetREST("/apartments/" + objectID)
			.then(function(responce){
				let obj = this.GetObject(objectType,objectID);
				if(obj == null){
					console.error(`Object ${objectID} of type ${objectType} not found!`);
					return;
				}
				obj.data = responce.data;
				obj.dataLoaded = true;

			}.bind(this))
			.catch(function(error){
				console.log(error);
			}.bind(this));
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
				console.error(`Object of type ${objectType} and id ${objectID} is not open!`);
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
				console.warn(`Object of type ${objectType} and id ${objectID} is already open!`)
				return;
			}

			this.CreateEmptyObject(objectType,objectID, editMode);

			this.RequestObjectData(objectType, objectID);

			if(editMode){
				ReserveObject(objectType, objectID);
			}

		},
		ObjectOpen(objectType, objectID){
			let object = this.GetObject(objectType,objectID);
			return object != null;
		},
		ObjectLoaded(objectType, objectID){
			let object = this.GetObject(objectType,objectID);
			if(object == null){
				console.warn(`Object of type ${objectType} and id ${objectID} has not been requested and thus will not be loaded!`);
				return false; 
			}
			return object.dataLoaded && (object.reserved || !object.editMode);
		},
		ReadObject(objectType, objectID){
			return this.GetObject(objectType, objectID);
		},


	}
});
export {useObjectManager};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}