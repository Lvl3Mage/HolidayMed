<script setup>
import {useAppConfig} from "@/stores/AppConfig";
import {useRouter} from "vue-router";
import {computed, ref, watch} from "vue";
import {gsap} from "gsap";

const AppConfig = useAppConfig();
const router = useRouter();
AppConfig.LoadApp().then(() => {
	setTimeout(() => {
		overlay.value = false;
		setTimeout(() => {
			router.push('/');
		},300);
	}, 500);
});
const loadingProgress = computed(() => {
	return AppConfig.appLoadProgress;
});
const currentProgress = ref(0);
watch(loadingProgress, (val) => {
	gsap.to(currentProgress, {value: val, duration: 0.5, ease: "power2.inOut"});
});
const overlay = ref(false);
setTimeout(() => {
	overlay.value = true;
}, 0);

</script>

<template>
	<div class="fixed w-full h-full top-0 left-0 group/progress-bar opacity-0 [&.active]:opacity-100 transition duration-300" :class="{'active': overlay}">
		<div class="z-40 absolute inset-0 bg-base-100 ">
			<div class="flex h-full w-full gap-3 justify-center items-center scale-0 group-[&.active]/progress-bar:scale-100 transition duration-300 ">
				<progress class="progress w-56" :value="currentProgress*1000" max="1000"></progress>
	
				<span class="loading loading-spinner loading-sm"></span>
				
			</div>

		</div>
	</div>
</template>