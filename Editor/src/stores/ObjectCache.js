import { defineStore } from 'pinia';
import {useObjectManager} from '@/stores/ObjectManager.js';
import {AssignAtPath, ReadAtPath, CreateAtPath} from '@/Utils.js';

const typeCacheFields = {
	"apartment": ["id", "title", "acf.group", "acf.inner_id"],
	"group": ["id", "title", "acf.building"],
	"reservation": ["id", "title"],
	"building": ["id", "title"],
	"media": ["id", "title", "link"],
}

const useObjectCache = defineStore({
	id: 'ObjectCache',
	state: () => {
		let ObjectManager = useObjectManager();
		return {
			ObjectManager: ObjectManager,
			cacheSegments: {},
			listenersSetup: false,
		};
	},
	getters: {
	},
	actions: {
		GetTypeFieldFilter(type){
			const fields = typeCacheFields[type];
			const filter = "_fields=id," + fields.join(",");
			return filter;
		},
		PopulateCache(){
			if(!this.listenersSetup){
				this.listenersSetup = true;
				this.ObjectManager.on(this.ObjectManager.events.succesfulWrite, this.UpdateSegmentWithData.bind(this));
				this.ObjectManager.on(this.ObjectManager.events.succesfulCreate, this.ReloadSegment.bind(this));
			}


			return new Promise((resolve, reject) => {
				let promises = [];
				for (let type in typeCacheFields) {
					this.cacheSegments[type] = {
						mappedData: {},
						hash: "",
						loading: false,
					};
					promises.push(this.ReloadSegment(type));
				}
				Promise.all(promises).then(() => {
					resolve();
				}).catch((error) => {
					reject(error);
				});
			});
		},
		ReloadSegment(type){
			this.cacheSegments[type].loading = true;
			return new Promise(async (resolve, reject) => {
				let totalPages = 1;
				let currentPage = 1;
				while(currentPage <= totalPages){
					break;
					//request pages one by one using ObjectManager.GetPage and update total pages using X-WP-TotalPages header
				}
				this.cacheSegments[type].loading = false;
				resolve(this.cacheSegments[type].mappedData);
			});
		},
		AddEntriesToSegment(type, entires){
			for (let entry of entires) {
				this.cacheSegments[type].mappedData[entry.id] = entry;
			}
		},
		RequestPage(type, page, perPage){
			return new Promise((resolve, reject) => {
				if(! type in typeCacheFields){console.error("Invalid type: " + type); reject("Invalid type: " + type); return;}
				this.ObjectManager.GetObjects(type, this.GetTypeFieldFilter(type) + `&page=${page}&per_page=${perPage}`).then((result) => {
					resolve(result);
				}).catch((error) => {
					reject(error);
				});
			});
		},
		UpdateSegmentWithData(type, objectId, data){
			// console.log(data)
			let hashBefore = this.cacheSegments[type].hash;
			this.cacheSegments[type].hash = data.fields_hash.after;
			if(hashBefore != data.fields_hash.before){
				console.log(`Hash mismatch, reloading segment, ${type}`);
				this.ReloadSegment(type);
				return;
			}
			let cachedFields = typeCacheFields[type];
			for (let field of cachedFields) {
				let path = field.split(".");
				let value = ReadAtPath(data, path);
				if(value){
					AssignAtPath(this.cacheSegments[type].mappedData[objectId],path, value);
				}
			}
			console.log(`Hash intact, Updated segment ${type}`);
		},
		CreateSegmentEntryWithData(type, data){
			let cachedFields = typeCacheFields[type];
			let id = data.id;
			let cachedObject = {};
			for (let field of cachedFields) {
				let path = field.split(".");
				let value = ReadAtPath(data, path);
				if(value){
					CreateAtPath(cachedObject, path);
					AssignAtPath(cachedObject, path, value);
				}
			}
			this.cacheSegments[type].mappedData[id] = cachedObject;

			console.log(`Updated segment, ${type}`);
		},
		DeleteSegmentEntry(type, id, data){
			delete this.cacheSegments[type].mappedData[id];
		},

		SegmentLoading(type){
			return this.cacheSegments[type].loading;
		},
		GetSegmentData(type){
			return this.cacheSegments[type].mappedData;
		},
		GetSegmentRows(type){
			return Object.keys(this.cacheSegments[type].mappedData).map(id => this.cacheSegments[type].mappedData[id]);
		},
		GetObject(type, id){
			return this.cacheSegments[type].mappedData[id];
		},
	}
});
export {useObjectCache};