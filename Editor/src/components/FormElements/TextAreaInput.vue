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
	<textarea ref="input" v-model="value" class="textarea textarea-bordered" :class="{'textarea-error' : !isValid() && displayValidation}" :placeholder="placeholder" @blur="$emit('blur', $event)" @focus="$emit('focus',$event)">
		
	</textarea>
</template>
<style scoped lang="scss">
</style>