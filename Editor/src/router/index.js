import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import {useLoginState} from '@/stores/LoginState.js'

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
			path: '/',
			name: 'home',
			component: HomeView
		},
	]
});

//login guard
router.beforeEach(async (to, from) => {
	const loginState = useLoginState();
	if (!loginState.isAuthenticated() && to.name !== 'login') {
		return { name: 'login' }
	}
})
export default router
