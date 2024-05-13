import { defineStore } from 'pinia';
import {useObjectManager} from '@/stores/ObjectManager.js';
import {AssignAtPath, ReadAtPath, CreateAtPath} from '@/Utils.js';

const typeCacheFields = {
	"apartment": ["id", "title", "acf.group", "acf.inner_id", "translations"],
	"group": ["id", "title", "acf.edificio", "acf.title"],
	"reservation": ["id", "title", "acf.order", "acf.apartment", "acf.start_date", "acf.end_date"],
	"building": ["id", "title", "acf.title"],
	"media": ["id", "title", "link"],
	"order": ["id", "title", "acf.order_status"],
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
				this.ObjectManager.on(this.ObjectManager.events.succesfulCreate, this.CreateSegmentEntryWithData.bind(this));
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
			this.cacheSegments[type].mappedData = {};
			this.cacheSegments[type].loading = true;
			return new Promise(async (resolve, reject) => {
				let totalPages = 1;
				let currentPage = 1;
				while(currentPage <= totalPages){
					let pageData = await this.ObjectManager.GetPage(type, currentPage, 100, this.GetTypeFieldFilter(type));
					// console.log("Recieved DATA for type", type, pageData.data);
					this.AddEntriesToSegment(type, pageData.data);
					// console.log("Assigned DATA for type", type, this.cacheSegments[type].mappedData);
					totalPages = pageData.headers["x-wp-totalpages"];
					currentPage++;
				}
				this.cacheSegments[type].loading = false;
				resolve(this.cacheSegments[type].mappedData);
			});
		},
		AddEntriesToSegment(type, entries){
			let mappedEntries = entries.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {});
			this.cacheSegments[type].mappedData = {...this.cacheSegments[type].mappedData, ...mappedEntries};
		},
		UpdateSegmentWithData(type, objectId, data){
			let hashBefore = this.cacheSegments[type].hash;
			if(!data.fields_hash){
				console.log("No hash in data, reloading segment");
				this.ReloadSegment(type);
				return;
			}
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
			let hashBefore = this.cacheSegments[type].hash;
			if(!data.fields_hash){
				console.log("No hash in data, reloading segment");
				this.ReloadSegment(type);
				return;
			}
			this.cacheSegments[type].hash = data.fields_hash.after;
			if(hashBefore != data.fields_hash.before){
				console.log(`Hash mismatch, reloading segment, ${type}`);
				this.ReloadSegment(type);
				return;
			}
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

			console.log(`Hash intact, Created entry in segment ${type} with data ${data}`);
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