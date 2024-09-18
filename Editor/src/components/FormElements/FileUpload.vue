<script setup>
	import {ref} from "vue";
	import {useUIManagement} from "@/stores/UIManagment";
	import {useObjectManager} from "@/stores/ObjectManager";

	const UIManagement = useUIManagement();
	const ObjectManager = useObjectManager()
	const props = defineProps({
		selectMultiple: {
			type: Boolean,
			required: false,
			default: false,
		},
		onUpload:{
			type: Function,
			required: false, 
			default: ()=>{},
		},
		getSuccessMessage:{
			type: Function,
			required: false, 
			default: (file)=>`Uploaded ${file.name}`,
		},
		getErrorMessage:{
			type: Function,
			required: false, 
			default: (file)=>`Error while uploading ${file.name}`,
		}
	})

	const files = ref([]);
	function LoadFile(e){
		files.value = e.target.files;
	}
	function UploadValid(){
		return files.value !== undefined && files.value.length !== 0 && !uploading.value;
	}
	const uploading = ref(false);
	const uploadField = ref(null);
	function RunUpload(){
		if (uploading.value){
			return;
		}
		if (!UploadValid()){
			return;
		}
		const toast = UIManagement.OpenToast({
			text: `Uploading!`,
			appearance: 'loading',
		});
		uploading.value = true;
		const uploads = [];
		for (const file of files.value){
			uploads.push(UploadFile(file));
		}
		Promise.all(uploads).then(()=>{
			toast.CloseToast();
			uploading.value = false;
			uploadField.value.value = null;
		});
	}
	function UploadFile(file){
		return ObjectManager.UploadFile('media', file).then(result => {
			props.onUpload(result);
			UIManagement.OpenToast({
				text: props.getSuccessMessage(file),
				appearance: 'success',
				closeOnClick:true,
				lifetime:1000,
			})
		}).catch(error => {
			console.error(error);
			UIManagement.OpenToast({
				text: props.getErrorMessage(file),
				appearance: 'error',
				closeOnClick:true,
				lifetime:1000,
			});
		});
	}
	defineExpose({
		uploading,
	})
</script>

<template>
	<div class="flex justify-between items-baseline my-3">
		<label class="form-control w-full max-w-xs">
			<input ref="uploadField" type="file" :multiple="props.selectMultiple" class="file-input file-input-bordered w-full max-w-xs" accept="image/png, image/jpeg, image/jpg" @change="LoadFile"/>
		</label>
		<button class="btn btn-accent" :class="{'btn-disabled': !UploadValid()}"  @click="RunUpload()"><slot>Upload</slot></button>
	</div>
</template>

<style scoped lang="scss">

</style>