<script setup>

	import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
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
	const valid = computed(()=>{
		if(props.validate != undefined){
			return props.validate(value.value);
		}
		return true;
	});
	const input = ref(null);
	function focus(){
		if(input.value){
			input.value.focus();
		}
	}

	defineExpose({
		valid,
		focus,
	});

</script>
<template>
	<label class="input input-bordered flex items-center gap-2" :class="{'input-error' : !valid && displayValidation}">
		<slot name="before"></slot>
		<input ref="input" v-model="value" :type="type" :placeholder="placeholder"  class="grow min-w-0" @blur="$emit('blur', $event)" @focus="$emit('focus',$event)"/>
		<slot name="after"></slot>
	</label>
</template>
<style scoped lang="scss">
</style>