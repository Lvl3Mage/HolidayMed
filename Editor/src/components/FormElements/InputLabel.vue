<script setup>
	import { ref, computed } from 'vue';
	import { v4 as uuidv4 } from 'uuid';

	const props = defineProps({
		valid: {
			type: Boolean,
			required: false,
		},
		validatedInput: {
			type: Object,
			required: false,
		},
		displayValidation: {
			type: Boolean,
			default: true,
			required: false,
		},
	});

	function isValid(){
		if(props.validatedInput){
			return props.validatedInput.isValid();
		}
		return props.valid;
	}
	const valid = computed(()=>{
		return isValid();
	})
	const uniqueId = uuidv4();
	defineExpose({
		isValid,
		uniqueId
	});
</script>
<template>
	<div class="form-control">
		<div class="label" v-if="$slots.label || $slots.labelRight">
			<span class="label-text">
				<slot name="label"></slot>
			</span>
			<span class="label-text">
				<slot name="labelRight"></slot>
			</span>
		</div>
		<slot></slot>
		<div class="label" v-if="$slots.labelAlt || $slots.labelAltRight">
			<span class="label-text-alt">
				<slot name="labelAlt"></slot>
			</span>
			<span class="label-text-alt">
				<slot name="labelAltRight"></slot>
			</span>
		</div>
		<div class="label" v-if="$slots.invalid && !valid && props.displayValidation">
			<span class="label-text-alt text-error">
				<slot name="invalid"></slot>
			</span>
		</div>
		
	</div>
</template>
<style scoped lang="scss">
</style>