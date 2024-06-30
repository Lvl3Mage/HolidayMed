<script setup>

	import {ref, computed, shallowReactive, watch, reactive} from "vue";
	import {formValueValidation} from "@/Utils.js";
	import Input from "@/components/FormElements/Input.vue"
	import InputLabel from "@/components/FormElements/InputLabel.vue"
	import SelectInput from '@/components/FormElements/SelectInput.vue';
	import TableDataDisplay from '@/components/TableDataDisplay.vue';
	import CacheSegmentRenderer from '@/components/CacheSegmentRenderer.vue';



	import {useObjectCache} from '@/stores/ObjectCache'
	import {useUIManagement} from '@/stores/UIManagment.js'
	import {useValidationGroup} from '@/components/FormElements/ValidationGroup.js'
	import {useObjectData} from '@/components/Modals/ModalRenderers/ObjectData.js'

	const ObjectCache = useObjectCache();
	const UIManagment = useUIManagement();


	const props = defineProps({
		objectData: {
			type: Object,
			required: true,
		},
	});
	const objectData = useObjectData(props.objectData, (data)=>{
	});


	function getAcf(){
		return props.objectData.acf;
	};

	
	const inputGroup = reactive(useValidationGroup());

	function ViewObj(objectType, objectId){
		UIManagment.OpenEditObjectModal(objectType, objectId).then((result) => {
			console.log(result.code, result.data);
		}).catch((error) => {
			console.error(error.code, error.data);
		});
	}
	defineExpose({
		isValid : inputGroup.isValid,
		GetTitle: () => "Uploading Media",
	});
</script>
<template>
	<!-- LEFTOFF TODO -> NEED TO ADD A TYPE SYSTEM TO THE MODAL WINDOWS WITH MODAL WINDOW LOOKUP IN THE GENERIC UI RENDERER -->
	<label class="form-control w-full max-w-xs">
		<div class="label">
			<span class="label-text">Pick a file</span>
		</div>
		<input type="file" class="file-input file-input-bordered w-full max-w-xs" accept="image/png, image/jpeg, image/jpg" @change="LoadFile"/>
	</label>
</template>