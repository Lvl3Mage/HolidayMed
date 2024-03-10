import { defineStore } from 'pinia';
import {useObjectManager} from './ObjectManager.js';

const typeCacheFields = {
	"apartment": ["id", "title", "acf.group"],
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
			return new Promise((resolve, reject) => {
				let promises = [];
				for (let type in typeCacheFields) {
					this.cacheSegments[type] = {
						mappedData: {},
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
			this.cacheSegments[type].loading = false;
			return new Promise((resolve, reject) => {
				if(! type in typeCacheFields){console.error("Invalid type: " + type); reject("Invalid type: " + type); return;}
				this.ObjectManager.GetObjects(type, this.GetTypeFieldFilter(type)).then((result) => {
					let mappedData = Object.assign({}, ...result.map((element) => ({[element.id]: element})));

					this.cacheSegments[type].mappedData = mappedData;
					resolve(mappedData);
				}).catch((error) => {
					reject(error);
				})
				.finally(() => {
					this.cacheSegments[type].loading = false;
				});
			});
		},
		UpdateSegmentData(type, object){
			//TODO updates the cache segment with the new object in order to avoid a reload
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