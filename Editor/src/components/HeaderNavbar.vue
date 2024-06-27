<script setup>
	import { ref } from 'vue'
	import { useLoginState } from '@/stores/LoginState.js'
	import { RouterLink, useRouter} from 'vue-router'
	const LoginState = useLoginState();
	const router = useRouter();

	
	const sidebarOpen = ref(false);
	function Logout(){
		LoginState.ClearLoginData();
		router.push('/login');
	}
</script>

<template>
	<div class="navbar bg-base-100 relative">
		<div class="navbar-start">
			<div class="dropdown">
				<label for="navbar-drawer" class="btn btn-ghost btn-circle" @click="sidebarOpen = !sidebarOpen">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
				</label>
			</div>
		</div>
		<div class="navbar-center">
			<div class="btn btn-ghost normal-case text-xl">
				<RouterLink to="/">HolidayMed</RouterLink>
			</div>
		</div>
		<div class="navbar-end">
			<!-- <button class="btn btn-ghost btn-circle text-xl">
				<i class="fa-solid fa-user"></i>
			</button>
			<button class="btn btn-ghost btn-circle text-xl">
				<i class="fa-solid fa-bell"></i>
			</button> -->
			<button class="btn btn-ghost btn-circle text-xl" @click="Logout()">
				<i class="fa-solid fa-arrow-right-from-bracket"></i>
			</button>
		</div>
	</div>
</template>
<style scoped lang="scss">
</style>