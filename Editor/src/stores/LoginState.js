import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {useAPIAccess, axios} from './APIAccess.js';

const useLoginState = defineStore({
	id: 'LoginState',
	state: () => ({
		APIAccess: useAPIAccess(),
		loginData: null,
	}),
	computed: {
	},
	actions: {
		AttemptLogin(username, password, remember){
			return new Promise((resolve, reject) => {
				this.APIAccess.Post('/wp-json/jwt-auth/v1/token', {
					username: username,
					password: password
				}).then((response) => {
					this.SetLoginData(response.data, remember);
					this.loginData.verified = true;
					resolve(response);
				}).catch((error) => {
					reject(error);
				});
			});
		},
		SetLoginData(data, remember = false){
			this.loginData = data;
			axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
			if(remember){
				localStorage.setItem('loginData', JSON.stringify(data));
			}
		},
		ClearLoginData(){
			this.loginData = null;
			delete axios.defaults.headers.common['Authorization'];
			localStorage.removeItem("loginData");
		},
		StorageLogin(){
			let data = localStorage.getItem('loginData');
			if(data != null){
				data = JSON.parse(data);
				this.SetLoginData(data);
				return new Promise((resolve, reject) => {
					this.APIAccess.Post('/wp-json/jwt-auth/v1/token/validate', {}).then((response) => {
						this.loginData.verified = true;
						resolve(response);
					}).catch((error) => {
						this.ClearLoginData();
						console.log("login failed")
						reject(error);
					});
				});
			}
			return new Promise((resolve, reject) => {throw new Error('No token stored');});
		},
		isAuthenticated(){
			if(this.loginData == null){
				return false;
			}
			return this.loginData.verified;
		}
	}
});
export {useLoginState};