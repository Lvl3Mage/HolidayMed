<script setup>
	import { ref, computed } from 'vue';

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
			return props.validatedInput.valid;
		}
		return props.valid;
	}
</script>
<template>
	<label class="form-control">
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
		<div class="label" v-if="$slots.invalid && !isValid() && props.displayValidation">
			<span class="label-text-alt text-error">
				<slot name="invalid"></slot>
			</span>
		</div>
		
	</label>
</template>
<style scoped lang="scss">
</style>