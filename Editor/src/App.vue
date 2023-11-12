<script>
	import {useAPIAccess} from './stores/APIAccess.js'
	export default {
		data: () => ({
			sidebarOpen:false,
			navLinks: [
				{
					text:"Home",
					address:"/",
					subLinks:[
						{
							text:"sublink",
							address:"/xd",
						},
						{
							text:"sublink",
							address:"/xd",
						},
						{
							text:"sublink",
							address:"/xd",
						},
					]
				},
				{
					text:"Home",
					address:"/",
					subLinks:[
						{
							text:"sublink",
							address:"/xd",
						},
						{
							text:"sublink",
							address:"/xd",
						},
						{
							text:"sublink",
							address:"/xd",
						},
					]
				},
				{
					text:"Home",
				},
				{
					text:"Home",
					address:"/"
				},
			]
		}),
		created(){
		},
		methods: {
		}
	}; 
</script>

<script setup>
	import HeaderNavbar from './components/HeaderNavbar.vue'
	import NavDropdown from './components/NavDropdown.vue'
	import NavElement from './components/NavElement.vue'
	import { RouterLink, RouterView } from 'vue-router'
	const APIAccess = useAPIAccess();
</script>

<template>
	<div class="drawer">
		<input id="navbar-drawer" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content">
			<HeaderNavbar ></HeaderNavbar>
			<RouterView />
		</div> 
		<div class="drawer-side">
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

<style scoped>
</style>
