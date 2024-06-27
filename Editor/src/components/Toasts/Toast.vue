<script setup>
	import gsap from 'gsap';


	import {useUIManagement} from "@/stores/UIManagment.js"
	const UIManagment = useUIManagement();

	import {ref, computed, onMounted} from "vue";
	const props = defineProps({
		toastData: {
			type: Object,
			required: true,
		}
	});
	const toastElement = ref(null);
	const toastHeight = ref(0);
	const toastVisible = ref(false);
	const toastClosed = ref(false);

	function ToggleToast(toggleVal){
		return new Promise((resolve, reject) => {
			const targetHeight = toggleVal ? toastElement.value.offsetHeight : 0;
			gsap.to(toastHeight, { duration: 0.3, value: targetHeight, onComplete: resolve});
			toastVisible.value = toggleVal;
			setTimeout(() => {
				resolve();
			}, 300);
		});
	}
	onMounted(() => {
		ToggleToast(true);
	});
	props.toastData.closePromiseTask = function(){
		if(toastClosed.value){
			return new Promise((resolve, reject) => {
				reject("Toast already closed");
			})
		}
		toastClosed.value = true;
		return ToggleToast(false);
	};
	const attrs = props.toastData.attrs;
	if(attrs.promise){
		attrs.task.then(() => {
			props.toastData.CloseToast();
		});
	}
	if(attrs.lifetime){
		setTimeout(() => {
			props.toastData.CloseToast();
		}, attrs.lifetime);
	}
	function GetWrapperClass(){
		const appearanceClassLookup = {
			"loading" : "alert-info",
			"error" : "alert-error",
			"success" : "alert-success",	
			"info" : "alert-info",			
		};
		if(attrs.appearance){
			return appearanceClassLookup[attrs.appearance];
		}
		if(attrs.wrapperClass){
			return attrs.wrapperClass;
		}
		return "alert-info";
	}
	function GetIcon(){
		const appearanceIconLookup = {
			"loading" : `<span class="loading loading-spinner loading-md"></span>`,
			"error" : `<i class="fa-solid fa-square-xmark"></i>`,
			"success" : `<i class="fa-solid fa-check-double"></i>`,
			"info" : `<i class="fa-solid fa-circle-info"></i>`,
		};
		if(attrs.hideIcon){
			return "";
		}
		if(attrs.iconHtml){
			return attrs.iconHtml;
		}
		if(attrs.appearance){
			return appearanceIconLookup[attrs.appearance];
		}
		return "";
	}
	function HandleClick(){
		if(attrs.closeOnClick){
			props.toastData.CloseToast();
		}
	}
</script>
<template>
	<div class="transition duration-300" :class="{'opacity-0' : !toastVisible}" :style="`height: ${toastHeight}px;`" >
		<div class="alert" :class="[GetWrapperClass(), {'cursor-pointer': attrs.closeOnClick}]" ref="toastElement" @click="HandleClick()">
			<div class="flex items-center gap-4">
				<span v-if="GetIcon() != ''" v-html="GetIcon()"></span>
				<span v-if="attrs.htmlContent" v-html="attrs.htmlContent"></span>
				<span v-else-if="attrs.text">{{attrs.text}}</span>
				
			</div>
		</div>
	</div>
</template>