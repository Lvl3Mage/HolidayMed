import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios';

const apiBaseURL = 'https://hm.dev.marmadot.com'; 
const useAPIAccess = defineStore({
	id: 'APIAccess',
	state: () => ({
		
	}),
	computed: {
	},
	actions: {
		GetREST(path){
			return this.Get("/wp-json/wp/v2" + path)
		},
		Get(path){
			return axios.get(apiBaseURL + path);
		},
		PostREST(path, data){
			return this.Post("/wp-json/wp/v2" + path, data);
		},
		Post(path, data){
			return axios.post(apiBaseURL + path, data);
		},
		DeleteREST(path){
			return this.Delete("/wp-json/wp/v2" + path)
		},
		Delete(path){
			return axios.delete(apiBaseURL + path);
		},
		OptionsREST(path){
			return this.Options("/wp-json/wp/v2" + path)
		},
		Options(path){
			return axios.options(apiBaseURL + path);
		},
	}
});
export {useAPIAccess, axios};