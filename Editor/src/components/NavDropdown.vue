<script >
	export default{
		props: {
			subLinks: Object,
			selfLink:{
				type: String,
				required: false,
				default: '',
			}
		},
		data() {
			return {
				open: false,
			}
		},
		created(){
		},
		mounted(){
		},
		watch:{
			// modelValue:function(val){
			// 	this.selectedDate = val;
			// },
		},
		// emits: ['update:modelValue'],
		methods: {
			pathSelected(path){
				return this.$route.path == path;
			}
		},
		computed: {
		}
	}
</script>
<script setup>
	import { RouterLink } from 'vue-router'
</script>
<template>
	<div class="collapse collapse-arrow" :class="{'collapse-open':open}" @click="open = !open">
		<div class="collapse-title text-lg font-medium transition" :class="{'text-accent': pathSelected(selfLink)}">
			<div v-if="selfLink" class="">
				<RouterLink @click.stop :to="selfLink"><slot></slot></RouterLink>
			</div>
			<div v-else class=""><slot></slot></div>
			
		</div>
		<div class="collapse-content"> 
			<div v-for="subLink in subLinks" :key="subLink.id" class="p-1 transition" :class="{'text-accent': pathSelected(subLink.address)}">
				<!-- {{subLink.address}} -->
				<RouterLink @click.stop :to="subLink.address">{{subLink.text}}</RouterLink>
			</div>
		</div>
	</div>
</template>
<style scoped lang="scss">
</style>