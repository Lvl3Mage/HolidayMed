<script >
	export default{
		props: {
			selfLink:{
				type: String,
				required: false,
				default: '',
			}
		},
		data() {
			return {
			}
		},
		created(){
		},
		mounted(){
		},
		watch:{
			// selection:function(val){
			// 	this.selectedDate = val;
			// },
		},
		// emits: ['update:selection'],
		methods: {
		},
		computed: {
			selected(){
				return this.$route.path == this.selfLink;
			},
		}
	}
</script>
<script setup>
	import { RouterLink } from 'vue-router'
</script>
<template>
	<div class="text-lg font-medium p-4 transition" :class="{'text-accent': selected}">
		<RouterLink v-if="selfLink" :to="selfLink"><slot></slot></RouterLink>
		<span v-else><slot></slot></span>
	</div>
</template>
<style scoped lang="scss">
</style>