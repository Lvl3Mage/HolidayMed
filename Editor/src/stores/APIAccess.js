import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios';

const apiBaseURL = 'https://hm.dev.marmadot.com'; 
const useAPIAccess = defineStore({
	id: 'APIAccess',
	state: () => ({
		
	}),
	getters: {
	},
	actions: {
		Request(path){
			return axios.get(apiBaseURL + path);
		},
		RequestREST(path){
			return axios.get(apiBaseURL + "/wp-json/wp/v2" + path)
		},
		Post(path, data){
			return axios.post(apiBaseURL + path,data);
		}
	}
});
export {useAPIAccess, axios};