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
	<textarea ref="input" v-model="value" class="textarea textarea-bordered" :class="{'textarea-error' : !valid && displayValidation}" :placeholder="placeholder" @blur="$emit('blur', $event)" @focus="$emit('focus',$event)">
		
	</textarea>
</template>
<style scoped lang="scss">
</style>