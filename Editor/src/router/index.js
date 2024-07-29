import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import OrderView from '@/views/OrderView.vue'
import LoginView from '@/views/LoginView.vue'
import {useLoginState} from '@/stores/LoginState.js'
import AppLoader from "@/views/AppLoader.vue";
import {useAppConfig} from "@/stores/AppConfig";
import CalendarView from "@/views/CalendarView.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/login',
			name: 'login',
			component: LoginView,
			beforeEnter: (to, from) => {
				const loginState = useLoginState();
				if(loginState.isAuthenticated()){
					return { name: 'home' };
				}
			},
		},
		{
			path: '/loading',
			name: 'loading',
			component: AppLoader,
			beforeEnter: (to, from) => {
				const AppConfig = useAppConfig();
				if(AppConfig.appLoaded) {
					return {name: 'home'};
				}
			}
		},
		{
			path: '/',
			name: 'home',
			component: HomeView
		},
		{
			path: '/reservations',
			name: 'reservations',
			component: OrderView
		},
		{
			path: '/calendar',
			name: 'calendar',
			component: CalendarView
		},
	]
});

//login guard
router.beforeEach(async (to, from) => {
	const loginState = useLoginState();
	if (!loginState.isAuthenticated()) {
		if (to.name === 'login'){
			return true;
		}
		return { name: 'login' }
	}
	const AppConfig = useAppConfig();
	if(!AppConfig.appLoaded) {
		if (to.name === 'loading'){
			return true;
		}
		return {name: 'loading'};
	}
})
export default router
