<script setup>
import Modal from "@/components/Modals/Modal.vue";
import {useObjectCache} from "@/stores/ObjectCache";
import {useUIManagement} from "@/stores/UIManagment";
import {computed, readonly, ref, watch} from "vue";
import {useObjectManager} from "@/stores/ObjectManager";
import CacheSegmentRenderer from "@/components/CacheSegmentRenderer.vue";
import FileUpload from "@/components/FormElements/FileUpload.vue";
import ImageSelector from "@/components/FormElements/ImageSelector.vue";

const UIManagement = useUIManagement();
const ObjectCache = useObjectCache();
const ObjectManager = useObjectManager();
const props = defineProps({
	uniqueId: {
		type: Number,
		required: true,
	},
	selectMultiple: {
		type: Boolean,
		required: false,
		default: false,
	},
	selected: {
		type: Array,
		required: false,
		default: [],
	},

});
const selectedImages = ref([...props.selected]);
const modal = ref(null);

function DiscardModal() {
	modal.value.Close().then(() => {
		UIManagement.GetModalByUniqueId(props.uniqueId).resolve("canceled");
	});
}

function ApplySelection() {
	if (!isValid()) {
		return;
	}
	modal.value.Close().then(() => {
		let selected = selectedImages.value;
		if (!props.selectMultiple) {
			selected = selected[0];
		}
		UIManagement.GetModalByUniqueId(props.uniqueId).resolve("selected", selected);
	});
}

function isValid() {
	return (selectedImages.value.length > 0 || props.selectMultiple) && !fileUploadField.value?.uploading;
}

const fileUploadField = ref(null);
const selectorElement = ref(null);
</script>

<template>
	<Modal ref="modal">
		<CacheSegmentRenderer type="media" :render-when-loading="true">
			<ImageSelector ref="selectorElement"
			               v-model:selection="selectedImages"
			               :media="ObjectCache.GetSegmentRows(`media`)"
			               :process-media="true"
			               :rows-per-page="25"
			               :scroll="true"
			               :select-multiple="props.selectMultiple">
			</ImageSelector>
		</CacheSegmentRenderer>
		<div class="divider"></div>
		<FileUpload ref="fileUploadField"
		            :select-multiple="props.selectMultiple"
		            :get-success-message="(file)=>`Uploaded and selected ${file.name}`"
		            :on-upload="(result)=>selectorElement.SelectId(result.id)">
		</FileUpload>
		<div class="divider"></div>
		<div class="modal-action">
			<button class="btn btn-error" @click="DiscardModal()">Close</button>
			<button class="btn btn-success" :class="{'btn-disabled': !isValid()}" @click="ApplySelection()">Select
				({{ selectedImages.length }}) and close
			</button>
		</div>
	</Modal>
</template>

<style scoped lang="scss">

</style>