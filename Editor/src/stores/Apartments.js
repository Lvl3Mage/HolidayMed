import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {useAPIAccess} from './APIAccess.js';

const useApartments = defineStore({
	id: 'Apartments',
	state: () => {
		return {
			apiAcess: useAPIAccess(),
			apartments: [
				{
					id: "HM034",
					building: "CostaAzahar",
					group: "lt2hab",
				},
			],
		};
	},
	getters: {
	},
	actions: {

	}
});
export {useApartments};