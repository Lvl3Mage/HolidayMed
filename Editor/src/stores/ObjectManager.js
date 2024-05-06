import { defineStore } from 'pinia';
import {useAPIAccess} from './APIAccess.js';
import {useObjectCache} from './ObjectCache.js';

import defaults from 'json-schema-defaults';
import {AssignAtPath, ReadAtPath} from '@/Utils.js';

import tv4 from 'tv4';
const typeRequestLookup = {
	"apartment": "/apartments",
	"group": "/groups",
	"reservation": "/reservations",
	"building": "/buildings",
	"media": "/media",
	"order": "/pedido",
};
let exampleObjectToken = "OBJECT_TOKEN";
const useObjectManager = defineStore({
	id: 'ObjectManager',
	state: () => {
		let APIAccess = useAPIAccess();
		let schemas = {};
		let types = Object.keys(typeRequestLookup);
		for (let type of types) {
			let cachedSchema = localStorage.getItem(type + "_schema");
			if(cachedSchema){
				if(cachedSchema != "undefined"){
					schemas[type] = JSON.parse(cachedSchema);

				}
			}
		}
		return {
			APIAccess: APIAccess,
			ObjectCache: useObjectCache(),
			schemas: schemas,
			events: {
				succesfulWrite: "succesfulWrite",
				failedWrite: "failedWrite",
				succesfulRead: "succesfulRead",
				failedRead: "failedRead",
				succesfulCreate: "succesfulCreate",
				failedCreate: "failedCreate",
				succesfulDelete: "succesfulDelete",
				failedDelete: "failedDelete",
			},
			eventListeners: {},
		};
	},
	getters: {
		types(){
			return Object.keys(typeRequestLookup);
		}
	},
	actions: {
		CallEvent(eventType, args){
			if(this.events[eventType] == undefined){
				console.error("Invalid event: " + eventType);
				return;
			}
			if(this.eventListeners[eventType]){
				for (let listener of this.eventListeners[eventType]) {
					listener(...args, eventType);
				}
			}
		},
		on(eventType, callback){
			if(this.events[eventType] == undefined){
				console.error("Invalid event: " + action);
				return;
			}
			if(! this.eventListeners[eventType]){
				this.eventListeners[eventType] = [];
			}
			this.eventListeners[eventType].push(callback);
		},
		GetObject(objectType, objectID){
			return new Promise((resolve, reject) => {
				this.APIAccess.GetREST(typeRequestLookup[objectType] + "/" + objectID)
				.then(function(responce){
					SetDefaultAsInvalid(this.schemas[objectType], responce.data);
					this.CallEvent(this.events.succesfulRead, [objectType, objectID, responce.data]);
					resolve(responce.data);
				}.bind(this))
				.catch(function(error){
					this.CallEvent(this.events.failedRead, [objectType, objectID, error.response]);
					console.warn(error);
					reject(error.response);
				}.bind(this));
			});
		},
		WriteObject(objectType, objectID, objectData){
			SetDefaultAsInvalid(this.schemas[objectType], objectData);
			return new Promise((resolve, reject) => {
				this.APIAccess.PostREST(typeRequestLookup[objectType] + "/" + objectID, objectData)
				.then(function(responce){
					this.CallEvent(this.events.succesfulWrite, [objectType, objectID, responce.data]);
					resolve(responce.data);
				}.bind(this))
				.catch(function(error){

					this.CallEvent(this.events.failedWrite, [objectType, objectID, error.response]);
					console.warn(error);
					reject(error.response);
				}.bind(this));
			});
		},
		CreateObject(objectType, objectData){
			return new Promise((resolve, reject) => {
				this.APIAccess.PostREST(typeRequestLookup[objectType], objectData)
				.then(function(responce){

					SetDefaultAsInvalid(this.schemas[objectType], responce.data);
					this.CallEvent(this.events.succesfulCreate, [objectType, responce.data]);
					resolve(responce.data);
				}.bind(this))
				.catch(function(error){

					this.CallEvent(this.events.failedCreate, [objectType, error.response]);
					console.warn(error);
					reject(error.response);
				}.bind(this));
			});
		},
		DeleteObject(objectType, objectID){
			return new Promise((resolve, reject) => {
				this.APIAccess.DeleteREST(typeRequestLookup[objectType] + "/" + objectID)
				.then(function(responce){
					this.CallEvent(this.events.succesfulDelete, [objectType, objectID]);
					resolve(responce.data);
				}.bind(this))
				.catch(function(error){
					this.CallEvent(this.events.failedDelete, [objectType, objectID, error.response]);
					console.warn(error);
					reject(error.response);
				}.bind(this));
			});
		},
		GetPage(objectType, page, objectsPerPage, filters = ''){
			return new Promise((resolve, reject) => {
				this.APIAccess.GetREST(typeRequestLookup[objectType] + '?' + filters + `&page=${page}&per_page=${objectsPerPage}`)
				.then(function(responce){
					resolve(responce);
				}.bind(this))
				.catch(function(error){
					console.warn(error);
					reject(error.response);
				}.bind(this));
			});
		},
		UploadFile(objectType, file){
			return new Promise((resolve, reject) => {
				this.APIAccess.PostREST(typeRequestLookup[objectType], file, {
					headers: {
						'Content-Disposition':`attachment; filename=${file.name}`,
						'content-type': file.type, 
					},
				})
				.then(function(responce){

					this.CallEvent(this.events.succesfulCreate, [objectType, responce.data]);
					resolve(responce.data);
				}.bind(this))
				.catch(function(error){
					this.CallEvent(this.events.failedCreate, [objectType, error.response]);
					console.warn(error);
					reject(error.response);
				}.bind(this));
			});
		},
		UpdateSchemas(){

			let types = Object.keys(typeRequestLookup);
			for (let type of types) {
				if(this.schemas[type] == undefined){
					this.UpdateSchema(type);//immediate request
				}
				else{
					setTimeout(this.UpdateSchema.bind(this), 10*1000, type);//delayed request since schema is already cached
				}
			}
		},
		UpdateSchema(objectType){
			return new Promise((resolve, reject) => {
				this.APIAccess.OptionsREST(typeRequestLookup[objectType])
				.then(function(responce){
					let schema = responce.data.schema;
					this.schemas[objectType] = schema;
					localStorage.setItem(objectType + "_schema", JSON.stringify(schema));
					resolve(schema);
				}.bind(this))
				.catch(function(error){
					console.warn(error);
					reject(error.response);
				}.bind(this));
			});
		}
	}
});
export {useObjectManager};

function SetDefaultAsInvalid(schema, data){
	PatchSchemaNullTypes(schema);
	console.log("PATCHED SCHEMA: ", schema);
	const errors = tv4.validateMultiple(data, schema).errors;
	for (let error of errors) {
		console.log("INVALID: ", error);
		let path = error.dataPath.slice(1).split('/');
		console.log("PATH: ", path);
		let types = error.params.expected.split('/');
		console.log("TYPES: ", types);
		let curVal = ReadAtPath(data, path);
		let processedVal = AttemptConvert(types[0], curVal);
		if(processedVal == null){
			processedVal = GetDefault(types[0]);
		}
		console.log("PROCESS: ", processedVal);
		AssignAtPath(data, path, processedVal);
	}
}
function AttemptConvert(type, val){
	const typeLookup = {
		"string" : (data) => {return data.toString()},
		"number" : (data) => {return parseFloat(data)},
		"integer" : (data) => {return parseInt(data)},
		"object" : (data) => {return null},
		"array" : (data) => {return null},
		"boolean" : (data) => {return data == "true"},
		"null" : (data) => {return null},
	};
	let result = null
	if(type in typeLookup){
		result = typeLookup[type](val);
	}
	if(result == null){
		console.error("Failed to convert", val, "to", type);
	}
	return result;


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