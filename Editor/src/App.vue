<script>
	export default {
		data: () => ({
			sidebarOpen:false,
			navLinks: [
				{
					text:"Home",
					address:"/",
					// subLinks:[
					// 	// {
					// 	// 	text:"sublink",
					// 	// 	address:"/xd",
					// 	// },
					// 	// {
					// 	// 	text:"sublink",
					// 	// 	address:"/xd",
					// 	// },
					// 	// {
					// 	// 	text:"sublink",
					// 	// 	address:"/xd",
					// 	// },
					// ]
				},
				{
					text:"Reservas",
					address:"/reservations",
					// subLinks:[
					// 	// {
					// 	// 	text:"sublink",
					// 	// 	address:"/xd",
					// 	// },
					// 	// {
					// 	// 	text:"sublink",
					// 	// 	address:"/xd",
					// 	// },
					// 	// {
					// 	// 	text:"sublink",
					// 	// 	address:"/xd",
					// 	// },
					// ]
				},
				{
					text: "Calendar",
					address: "/calendar",
				}
				// {
				// 	text:"Home",
				// },
				// {
				// 	text:"Home",
				// 	address:"/"
				// },
			]
		}),
		mounted(){
		},
		methods: {
			Method(){
				console.log(this.ObjectManager);
			},
		}
	}; 
</script>

<script setup>

	import {useLoginState} from '@/stores/LoginState.js'
	const LoginState = useLoginState();

	import {useObjectManager} from '@/stores/ObjectManager.js'
	const ObjectManager = useObjectManager();
	
	import {useObjectCache} from '@/stores/ObjectCache.js'
	const ObjectCache = useObjectCache();

	import HeaderNavbar from '@/components/HeaderNavbar.vue'
	import NavDropdown from '@/components/NavDropdown.vue'
	import NavElement from '@/components/NavElement.vue'
	import GenericUIRenderer from '@/components/GenericUIRenderer.vue'
	import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
	<div class="drawer min-h-full">
		<input id="navbar-drawer" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content min-h-full flex flex-col">

			<GenericUIRenderer></GenericUIRenderer>
			<HeaderNavbar v-if="LoginState.isAuthenticated()"></HeaderNavbar>
			<RouterView class="grow"></RouterView>
		</div> 
		<div v-if="LoginState.isAuthenticated()" class="drawer-side z-40">
			<label for="navbar-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
			<ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
				<div class="join join-vertical w-full">
					<div v-for="navLink in navLinks" :key="navLink.id"  class="join-item border border-base-300">
						<NavDropdown v-if="navLink.subLinks" :selfLink="navLink.address" :subLinks="navLink.subLinks">{{navLink.text}}</NavDropdown>
						<NavElement v-else :selfLink="navLink.address">{{navLink.text}}</NavElement>
					</div>
				</div>
			</ul>
		</div>
	</div>
</template>
<style>
html{
	scrollbar-gutter: revert !important;
}
#app{
	min-height: 100vh;
	position: relative;
}
</style>