import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios';

const useAPIAccess = defineStore({
  id: 'APIAccess',
  state: () => ({
    
  }),
  getters: {
  },
  actions: {
  }
});
export {useAPIAccess, axios};