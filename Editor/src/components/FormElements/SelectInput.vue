<script setup>

	import { ref, computed } from 'vue';

	const emit = defineEmits(["update:modelValue", "change"])
	const props = defineProps({
		modelValue: {
			require: true,
		},
		options: {
			require: true,
			type: Array
		},
		render: {
			require: false,
			type: Function,
			default: option => option,
		},
		emptyContent: {
			require: false,
			type: String,
			default: "---",
		},
		dropdownClasses: {
			require: false,
			type: String,
			default: "",
		},
		buttonClasses: {
			require: false,
			type: String,
			default: "",
		},
		optionClasses: {
			require: false,
			type: String,
			default: "",
		},
		wrapOptions: {
			require: false,
			type: Boolean,
			default: false,
		},
		displayValidation: {
			require: false,
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
	function isValid(){
		return value.value != null;
	}
	defineExpose({
		isValid,
	});
	function RenderOption(option){
		if(option == null){
			return props.emptyContent;
		}
		return props.render(option);
	}
</script>
<template>
<div class="dropdown group/dropdown">
	<div tabindex="0" role="button" class="btn m-1" :class="[props.buttonClasses, {'border-error': !isValid() && displayValidation}]">
		<slot>
			<div v-html="RenderOption(value)"></div>
			<div class="group-focus-within/dropdown:rotate-180 transition">
				<i class="fa-solid fa-chevron-down"></i>
			</div>
		</slot>
	</div>
	<ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box max-h-40 overflow-auto flex flex-col flex-nowrap" :class="props.dropdownClasses">
		<li v-for="(option, index) in options" :key="index" @click="value = option"  class="" :class="[props.optionClasses]">
			<a v-html="props.render(option)" class="p-2" :class="[{'active': option == value}, {'whitespace-nowrap': !props.wrapOptions}]"></a>
		</li>
	</ul>
</div>
</template>