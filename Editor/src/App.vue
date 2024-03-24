<script>
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
	ObjectManager.UpdateSchemas();
	
	import {useObjectCache} from '@/stores/ObjectCache.js'
	const ObjectCache = useObjectCache();
	//TODO - chain behind login 
	ObjectCache.PopulateCache();

	import HeaderNavbar from '@/components/HeaderNavbar.vue'
	import NavDropdown from '@/components/NavDropdown.vue'
	import NavElement from '@/components/NavElement.vue'
	import GenericUIRenderer from '@/components/GenericUIRenderer.vue'
	import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
	<div class="drawer">
		<input id="navbar-drawer" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content">

			<GenericUIRenderer></GenericUIRenderer>
			<HeaderNavbar v-if="LoginState.isAuthenticated()"></HeaderNavbar>
			<RouterView></RouterView>
		</div> 
		<div v-if="LoginState.isAuthenticated()" class="drawer-side">
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