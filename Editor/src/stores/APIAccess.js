import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios';

const apiBaseURL = 'localhost'; 
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
    Post(path, data){
      return axios.post(apiBaseURL + path,data);
    }
  }
});
export {useAPIAccess, axios};