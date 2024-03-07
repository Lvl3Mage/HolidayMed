import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {useAPIAccess} from './APIAccess.js';

import defaults from 'json-schema-defaults';

import tv4 from 'tv4';
let exampleObjectData = {
	name: "OBJECT_NAME",
	// .. more fields go here
};
const typeRequestLookup = {
	"apartment": "/apartments",
	"group": "/groups",
	"reservation": "/reservations",
	"house": "/houses"
};
let exampleObjectToken = "OBJECT_TOKEN";
const useObjectManager = defineStore({
	id: 'ObjectManager',
	state: () => {
		let types = ["apartment", "group", "reservation", "house"];//MOVE TO GENERAL CONFIG
		let APIAccess = useAPIAccess();
		let schemas = {};
		// let defaultValues = {};
		for (let type of types) {
			APIAccess.OptionsREST(typeRequestLookup[type]).then((responce) => {

				let schema = responce.data.schema;
				schemas[type] = schema;
				// defaultValues[type] = ;
				// console.log(defaults(schema));
				// console.log(schema);
			}).catch((error) => {
				console.log(error);
			});
		}

		return {
			APIAccess: APIAccess,
			types: types,//MOVE TO GENERAL CONFIG
			schemas: schemas,
			// defaultValues: defaultValues,
		};
	},
	getters: {
	},
	actions: {
		GetObject(objectType, objectID){
			return new Promise((resolve, reject) => {
				this.APIAccess.GetREST(typeRequestLookup[objectType] + "/" + objectID)
				.then(function(responce){
					resolve(responce.data);
				})
				.catch(function(error){
					console.log(error);
					reject(error.responce);
				});
			});
		},
		ConvertEmptyToNull(object){
			for (let key in object) {
				if (object[key] === "") {
					object[key] = null;
				}
				if(typeof object[key] === 'object' && object[key] !== null){
					this.ConvertEmptyToNull(object[key]);
				}
				if(key == "rooms"){
					object[key] = [];
				}
			}
			return object;
		},
		WriteObject(objectType, objectID, objectData){
			DefaultInvalid(this.schemas[objectType], objectData);
			return new Promise((resolve, reject) => {
				this.APIAccess.PostREST(typeRequestLookup[objectType] + "/" + objectID, objectData)
				.then(function(responce){
					resolve(responce.data);
				})
				.catch(function(error){
					console.log(error);
					reject(error.responce);
				});
			});
		},
		CreateObject(objectType, objectData){
			return new Promise((resolve, reject) => {
				this.APIAccess.PostREST(typeRequestLookup[objectType], objectData)
				.then(function(responce){
					resolve(responce.data);
				})
				.catch(function(error){
					console.log(error);
					reject(error.responce);
				});
			});
		},
		DeleteObject(objectType, objectID){
			return new Promise((resolve, reject) => {
				this.APIAccess.DeleteREST(typeRequestLookup[objectType] + "/" + objectID)
				.then(function(responce){
					resolve(responce.data);
				})
				.catch(function(error){
					console.log(error);
					reject(error.responce);
				});
			});
		},
		GetObjects(objectType, filters = ''){
			return new Promise((resolve, reject) => {
				this.APIAccess.GetREST(typeRequestLookup[objectType] + '?' + filters)
				.then(function(responce){
					resolve(responce.data);
				})
				.catch(function(error){
					console.log(error);
					reject(error.responce);
				});
			});
		},
	}
});
export {useObjectManager};

function FillMissing(schema, data){

}
function DefaultInvalid(schema, data){
	PatchSchemaNullTypes(schema);
	console.log("SCHEMA: ", schema);
	const errors = tv4.validateMultiple(data, schema).errors;
	for (let error of errors) {
		console.log(error);
		let path = error.dataPath.slice(1).split('/');
		console.log("PATH: ", path);
		let types = error.params.expected.split('/');
		console.log("TYPES: ", types);
		console.log("Default: ", GetDefault(types[0]));
		AssignAtPath(data, path, GetDefault(types[0]));
	}
}
function AssignAtPath(data, path, value){
	let current = data;
	for(let i = 0; i < path.length-1; i++){
		current = current[path[i]];
	}
	console.log(current);
	return current[path[path.length-1]] = value;
}
function GetDefault(type){
	const typeLookup = {
		"string" : "",
		"number" : 0,
		"integer" : 0,
		"object" : {},
		"array" : [],
		"boolean" : false,
		"null" : null,
	}
	return typeLookup[type];
}
function PatchSchemaNullTypes(schema){//removes null from types in schema recursively
	for(let key in schema.properties){
		let types = schema.properties[key].type;
		for(let i = 0; i < types.length; i++){
			if(types[i] == "null"){
				types.splice(i, 1);
			}
		}
		if("properties" in schema.properties[key]){
			PatchSchemaNullTypes(schema.properties[key]);
		}
	}
	return schema;
}