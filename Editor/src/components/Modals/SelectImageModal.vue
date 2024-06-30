<script setup>
	import Modal from "@/components/Modals/Modal.vue";
	import {useObjectCache} from "@/stores/ObjectCache";
	import {useUIManagement} from "@/stores/UIManagment";
	import {ref} from "vue";
	const UIManagement = useUIManagement();
	const ObjectCache = useObjectCache();
	const props = defineProps({
		uniqueId: {
			type: Number,
			required: true,
		},
		selectMultiple: {
			type: Boolean,
			required: false,
			default: true,
		},
	});
	const selectedImages = ref([]);
	const modal = ref(null);
	function DiscardModal(){
		modal.value.Close().then(() => {
			UIManagement.GetModalByUniqueId(props.uniqueId).resolve("canceled");
		});
	}
	function ApplySelection(){
		modal.value.Close().then(() => {
			let selected = selectedImages.value;
			if(selected.length == 1){
				selected = selected[0];
			}
			UIManagement.GetModalByUniqueId(props.uniqueId).resolve("selected", selected);
		});
	}
	function IsMediaSelected(media){
		return selectedImages.value.includes(media.id);
	}
	function ToggleMediaSelection(media){
		if(IsMediaSelected(media)){
			selectedImages.value = selectedImages.value.filter(id => id != media.id);
		}else{
			if(props.selectMultiple){
				selectedImages.value.push(media.id);
			}else{
				selectedImages.value = [media.id];
			}
		}
	}
</script>

<template>
	<Modal ref="modal">
		<div class="flex flex-wrap gap-3 justify-around">
			<template v-for="media in ObjectCache.GetSegmentRows('media')">
				<div @click="ToggleMediaSelection(media)" class="card bg-base-100 w-32 max-w-full shadow-xl cursor-pointer outline outline-0 hover:outline-2 outline-secondary transition-all" :class="{'bg-base-200 !opacity-100 !outline-4 ':IsMediaSelected(media)}" >
<!--					<div class="card-body grow-0">-->
<!--						<div class="">-->
<!--							<h5 class="card-title break-all max-w-3/4" v-html="media.title.rendered"></h5>-->
<!--							<input type="checkbox" :checked="IsMediaSelected(media)" class="checkbox checkbox-secondary" />-->
<!--						</div>-->
<!--						-->
<!--					</div>-->
					<img  :src="media.media_details?.sizes?.medium?.source_url || media.link" class="w-full h-full object-contain rounded p-3 contrast-50 transition" :class="{'contrast-100':IsMediaSelected(media)}"/>
				</div>
				
			</template>
		</div>
	</Modal>
</template>

<style scoped lang="scss">

</style>