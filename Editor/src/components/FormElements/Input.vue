<script setup>

	import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
	import { v4 as uuidv4 } from 'uuid';
	const emit = defineEmits(['change','update:modelValue', 'blur', 'focus'])
	const props = defineProps({
		modelValue: {
			require: true,
		},
		placeholder: {
			type: String,
		},
		validate: {
			type: Function,
		},
		displayValidation: {
			type: Boolean,
			default: true,
		},
		type: {
			type: String,
			default: "text",
		},
	});
	const value = computed({
		get: () => props.modelValue,
		set: (val) => {
			emit('update:modelValue', val);
			emit('change');
		}
	});
	const isValid = ()=>{
		if(props.validate != undefined){
			return props.validate(value.value);
		}
		return true;
	};
	const input = ref(null);
	function focus(){
		if(input.value){
			input.value.focus();
		}
	}
	const uniqueId = uuidv4();
	defineExpose({
		isValid,
		focus,
		uniqueId,
	});

</script>
<template>
	<label class="input input-bordered flex items-center gap-2" :class="{'input-error' : !isValid() && displayValidation}">
		<slot name="before"></slot>
		<input ref="input" v-model="value" :type="type" :placeholder="placeholder"  class="grow min-w-0" @blur="$emit('blur', $event)" @focus="$emit('focus',$event)"/>
		<slot name="after"></slot>
	</label>
</template>
<style scoped lang="scss">
</style>