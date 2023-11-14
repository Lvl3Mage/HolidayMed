import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {useAPIAccess} from './APIAccess.js';


const useApartments = defineStore({
	id: 'Apartments',
	state: () => ({
		apiAcess: useAPIAccess(),
		apartments: [// ?? will the apartments be requested all at once
			{
				code: "HM034",
				building: "CostaAzahar",
				group: "lt2hab",
				data:{

				}
			},
		],
	}),
	getters: {
		isLoading(){
			return false;
		}
	},
	actions: {
		Get(){
			return this.apartments;
		},
		GetFiltered(filterFunc){
			return this.apartments.filter(filterFunc(apartment));
		},
		Refresh(){
			//
		},

	}
});
export {useApartments};