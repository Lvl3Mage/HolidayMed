import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {useAPIAccess} from './APIAccess.js';


const useReservations = defineStore({
	id: 'Reservations',
	state: () => ({
		apiAcess: useAPIAccess(),
		reservations: [
			{
				apartmentCode: "HM034",
				timeStart: new Date(),
				timeEnd: new Date(),
				clientID:"12332", // ?? is the client a separate object or just a name
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
			return this.reservations;
		},
		GetFiltered(filterFunc){
			return this.reservations.filter(filterFunc(reservation));
		},
		Refresh(){
			//
		},

	}
});
export {useApartments};