<script setup>
	import {useAPIAccess} from '@/stores/APIAccess.js';
	import {useLoginState} from '@/stores/LoginState.js';
	import { useRouter, useRoute } from 'vue-router'
	import { ref } from 'vue'
	const APIAccess = useAPIAccess();
	const LoginState = useLoginState();
	const router = useRouter()
	const username = ref("");
	const password = ref("");
	const displayValidation = ref(false);
	const usernameInput = ref(null);
	const passwordInput = ref(null);
	const errorMsg = ref("");
	const loading = ref(false);
	const remember = ref(false);
	function ToggleLoading(val){
		loading.value = val;
	}
	ToggleLoading(true);
	LoginState.StorageLogin().then(result => {
		ToggleLoading(false);
		if(result.data.code == "jwt_auth_valid_token"){
			router.push('/');
		}
	}).catch(error => {
		ToggleLoading(false);
		console.log(error.message);
	});


	function LogIn(){

		if(!usernameInput.value.isValid() || !passwordInput.value.isValid()){
			displayValidation.value = true;
			return;
		}
		ToggleLoading(true);
		LoginState.AttemptLogin(username.value,password.value, remember.value).then(result => {
			router.push('/');
		}).catch(error => {
			console.log(error.response.data.code)
			if(error.response.data.code == '[jwt_auth] incorrect_password'){
				errorMsg.value = error.response.data.message;
			}
			else if(error.response.data.code == '[jwt_auth] invalid_username'){
				errorMsg.value = error.response.data.message;
			}
			else{
				errorMsg.value = `Something went wrong...`;
				console.error(error)
			}
		}).finally(function(){
			ToggleLoading(false);
		});

	}

	import TextInput from "@/components/FormElements/TextInput.vue"
</script>

<template>
	<div class="fixed w-full h-full flex justify-center items-center">
		<div class="z-40 absolute inset-0 bg-black/20 flex justify-center items-center" v-if="loading">
				<span class="mr-3">Logging in...</span>
				<span class="loading loading-spinner loading-sm"></span>
		</div>
		<div class="card card-compact w-96 bg-base-100 shadow-xl">
			
			<div class="card-body">
				<div class="text-2xl">Login</div>
				<TextInput ref="usernameInput" class="w-full" v-model="username" :validate="val => val != ''" :displayValidation="displayValidation">
					<template v-slot:label>Username</template>
					<template v-slot:invalid>Cannot be empty</template>
					<template v-slot:before>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" /></svg>
					</template>
				</TextInput>
				<TextInput ref="passwordInput" class="w-full" v-model="password" :validate="val => val != ''" :displayValidation="displayValidation" type="password">
					<template v-slot:label>Password</template>
					<template v-slot:invalid>Cannot be empty</template>
					<template v-slot:before>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70"><path fill-rule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clip-rule="evenodd" /></svg>
					</template>
				</TextInput>
				<div class="form-control">
					<label class="label cursor-pointer">
						<span class="label-text">Remember me</span> 
						<input type="checkbox" class="toggle toggle-accent" v-model="remember"/>
					</label>
				</div>
				<button class="btn btn-secondary" @click="LogIn()">Log in</button>
				<div class="text-error login-error" v-html="errorMsg">
				</div>
				
			</div>
		</div>
	</div>
</template>
<style>
	.login-error a{
		text-decoration: underline;
	}
</style>
