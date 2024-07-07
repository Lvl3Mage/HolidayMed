import { defineStore } from 'pinia'
import {useAPIAccess} from '@/stores/APIAccess.js';
import {useObjectCache} from "@/stores/ObjectCache";
import {useObjectManager} from "@/stores/ObjectManager";
import {useUIManagement} from "@/stores/UIManagment";
const useAppConfig = defineStore({
	id: 'AppConfig',
	state: () => ({
		APIAccess: useAPIAccess(),
		ObjectCache: useObjectCache(),
		ObjectManager: useObjectManager(),
		UIManagement: useUIManagement(),
		/**
		 * @typedef {Object} Dictionary
		 * @property {Object} roomTypes
		 * @property {Object} bedTypes
		 * @property {Object} daysOfWeek
		 * @property {Object} positions
		 * @property {Object} typicalAdditionalCosts
		 * 
		 * 
		 */
		dictionary: null,
		filtersGroups: null,
		filterElements: null, 
		loaded: false,
		currentLoadingRequests: 0,
		maxLoadingRequests: 0,
	}),
	getters: {
		appLoaded(){
			return this.loaded;
		},
		appLoadProgress(){
			return 1 - this.currentLoadingRequests / this.totalLoadingRequests;
		}
	},
	actions: {
		/**
		 * 
		 * @returns {Dictionary}
		 * @constructor
		 */
		GetDictionary(){
			return this.dictionary;
		},
		GetFilterGroup(group_slug){
			return this.filtersGroups[group_slug];
		},
		GetFilterElement(slug){
			return this.filterElements[slug];
		},
		SetupFilters(data) {
			let filterData = data.acf.filters;
			filterData = filterData.filter((filter) => !filter.divider);
			filterData = filterData.map((filter) => ({
				title: filter.title,
				group_slug: filter.group_slug,
				nivel: filter.nivel,
				elements: [
					...(filter.elements || []),
					...(filter.elements_hidden || []),
				]
			}));
			let elements = filterData.map((filter) => filter.elements).flat();
			elements = elements.reduce((acc, element) => ({
				...acc, 
				[element.slug]: element,
			}), {});
			filterData = filterData.reduce((acc, filter) => ({
				...acc, 
				[filter.group_slug]: filter,
			}), {});
			this.filtersGroups = filterData;
			this.filterElements = elements;
		},
		SetupDictionary(data){
			let bedTypes = data.bed_types;
			bedTypes = bedTypes.reduce((acc, bedType) => ({
				...acc,
				[bedType.key]: bedType,
			}), {});
			let daysOfWeek = data.days_of_week;
			let positions = data.positions;
			positions = positions.reduce((acc, position) => ({
				...acc,
				[position.id]: position,
			}), {});
			let roomTypes = data.room_types;
			roomTypes = roomTypes.reduce((acc, roomType) => ({
				...acc,
				[roomType.key]: roomType,
			}), {});
			let typicalAdditionalCosts = data.typical_additional_costs;
			typicalAdditionalCosts = typicalAdditionalCosts.reduce((acc, cost) => ({
				...acc,
				[cost.key]: cost,
			}), {});
			this.dictionary = {
				bedTypes,
				daysOfWeek,
				positions,
				roomTypes,
				typicalAdditionalCosts
			};	
		},
		LoadApp(){
			let promises = [
				new Promise((resolve, reject) =>{
					this.APIAccess.Get('/wp-json/options/dictionary-es').then(data => {
						this.SetupDictionary(data.data);
						resolve();
					}).catch((error) => {
						reject(error);
					});
				}),
				new Promise((resolve, reject) =>{
					this.APIAccess.GetREST('/pages/135').then(data => {
						this.SetupFilters(data.data);
						resolve();
					}).catch((error) => {
						reject(error);
					});
				}),
				...(this.ObjectCache.PopulateCache()),
				...(this.ObjectManager.UpdateSchemas()),
			];
			this.totalLoadingRequests = promises.length;
			this.currentLoadingRequests = promises.length;
			for (let promise of promises) {
				promise.then(() => {
					this.currentLoadingRequests--;
				}).catch((error) => {
					this.UIManagement.OpenToast({htmlContent: `<div class='text-left'>Error loading app data,<br>${error.message}</div>`, appearance: "error", closeOnClick: true});
					console.error(error);
				});
			}
			return new Promise((resolve, reject) => {
				Promise.all(promises).then(() => {
					this.loaded = true;
					resolve();
				}).catch((error) => {   
					reject(error);
				});
			});
		}
	}
});
export {useAppConfig};