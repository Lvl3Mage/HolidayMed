import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios';

const apiBaseURL = 'https://hm.dev.marmadot.com'; 
const useAPIAccess = defineStore({
	id: 'APIAccess',
	state: () => ({
		ongoingRequests: 0,
	}),
	getters: {
	},
	actions: {
		
		CountRequest(request){
			return new Promise((resolve, reject) => {
				this.ongoingRequests++;
				request.then((response) => {
					this.ongoingRequests--;
					resolve(response);
				}).catch((error) => {
					this.ongoingRequests--;
					reject(error);
				});
			});
		},
		GetREST(path, options = {}){
			return this.Get("/wp-json/wp/v2" + path, options);
		},
		Get(path, options = {}){
			
			console.log("GETTING", apiBaseURL + path, options);
			return this.CountRequest(axios.get(apiBaseURL + path, options));
		},
		PostREST(path, data, options = {}){
			return this.Post("/wp-json/wp/v2" + path, data, options);
		},
		Post(path, data, options = {}){
			return this.CountRequest(axios.post(apiBaseURL + path, data, options));
		},
		DeleteREST(path, options = {}){
			return this.Delete("/wp-json/wp/v2" + path, options);
		},
		Delete(path, options = {}){
			return this.CountRequest(axios.delete(apiBaseURL + path, options));
		},
		OptionsREST(path, options = {}){
			return this.Options("/wp-json/wp/v2" + path, options);
		},
		Options(path, options = {}){
			return this.CountRequest(axios.options(apiBaseURL + path, options));
		},
	}
});
export {useAPIAccess, axios};