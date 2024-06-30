<script setup>

	import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
	import Input from "@/components/FormElements/Input.vue"
	import { v4 as uuidv4 } from 'uuid';
	import Fuse from 'fuse.js'

	const emit = defineEmits(["update:modelValue", "change"])
	const props = defineProps({
		modelValue: {
			require: true,
		},
		options: {
			require: true,
			type: Object
		},
		maxOptions: {
			require: false,
			type: Number,
			default: -1,
		},
		render: {
			require: false,
			type: Function,
			default: option => option,
		},
		getSearchValue: {
			require: false,
			type: Function,
		},
		emptyContent: {
			require: false,
			type: String,
			default: "━━",
		},
		dropdownClasses: {
			require: false,
			type: String,
			default: "",
		},
		buttonClass: {
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
		showIcon: {
			require: false,
			type: Boolean,
			default: true,
		},
		allowEmpty: {
			require: false,
			type: Boolean,
			default: false,
		},
	});
	/**
	 * 
	 * @type {WritableComputedRef<string>}
	 */
	const value = computed({
		get: () => props.modelValue,
		set: (val) => {
			emit('update:modelValue', val);
			emit('change');
		}
	});
	function RenderOptionKey(optionKey){
		if(optionKey == null){
			return props.emptyContent;
		}
		if (props.options[optionKey] === undefined){
			return props.emptyContent;
		}
		return props.render(props.options[optionKey]);
	}
	/**
	 * @type {Ref<boolean>}
	 */
	const isValid = ()=>{
		return props.options[value.value] !== undefined || props.allowEmpty;
	};
	
	const uniqueId = uuidv4();
	defineExpose({
		isValid,
		uniqueId,
	});
	function SearchRows(rows, getSearchValue, query){
		if(query == ""){
			return rows;
		}

		const options = {
			shouldSort: true,
		};

		const fuse = new Fuse(rows.map(row => getSearchValue(row.data)), options)
		const result = fuse.search(query);
		return result.map(resRow => rows[resRow.refIndex]);
	}
	const searchQuery = ref('');
	const optionRows = computed(() => {
		return Object.keys(props.options).map(key => ({
			key : key,
			data: props.options[key], 
		}));
	});
	/**
	 * @type {ComputedRef<Object.<key:string, data:Object>[]>}
	 */
	const processedOptions = computed(() => {
		let options = optionRows.value;

		if(props.getSearchValue){
			options = SearchRows(options, props.getSearchValue, searchQuery.value);
		}
		if(props.maxOptions > 0){
			options = options.slice(0, props.maxOptions);
		}
		return options;
	});
	/**
	 * @type {Ref<HTMLElement>}
	 */
	const dropdown = ref(null);
	const open = ref(false);
	function handleBlur(event) {
		if(dropdown.value == null){open.value = false; return;}
		open.value = dropdown.value.contains(event.relatedTarget);
	}
	function OpenDropdown(event) {
		open.value = true;
		searchQuery.value = '';
	}
	function CloseDropdown(){
		document.activeElement.blur();
		open.value = false;
	}

	
	const searchInput = ref(null);
	function handleKeydown(event){
		if(!open.value){return;}
		if(event.key == "Escape"){
			CloseDropdown();
			return;
		}
		if(event.key == "Enter"){
			if(processedOptions.value.length >= 1){
				value.value = processedOptions.value[0].key;
			}
			CloseDropdown();
			return;
		}
		if(searchInput.value){
			searchInput.value.focus();
			return;
		}
	}
	onMounted(() => {
		document.addEventListener('keydown', handleKeydown);
	});
	onBeforeUnmount(() => {
		document.removeEventListener('keydown', handleKeydown);
	});
</script>
<template>
<div ref="dropdown" class="dropdown group/dropdown relative min-w-56 w-fit" >
	
	<div class="w-full">
		<div tabindex="0" @blur="handleBlur" @focus="OpenDropdown" role="button" class="btn w-full justify-between" :class="[props.buttonClass, {'border-error': !isValid() && displayValidation}]">
			<slot>
				<div v-html="RenderOptionKey(value)"></div>
				<div class="group-focus-within/dropdown:rotate-180 transition" v-if="props.showIcon">
					<i class="fa-solid fa-chevron-down"></i>
				</div>
			</slot>
		</div>
	</div>
	<div class="absolute p-1 bottom-full w-full pointer-events-none -translate-y-3 opacity-0 group-focus-within/dropdown:opacity-100 group-focus-within/dropdown:pointer-events-auto group-focus-within/dropdown:translate-y-0 transition" v-if="props.getSearchValue">
		<Input ref="searchInput" @blur="handleBlur" class="input-xs min-w-full shadow-md" v-model="searchQuery" >
			<template v-slot:after><i class="fa-solid fa-magnifying-glass"></i></template>
		</Input>
	</div>
	<ul tabindex="0" @blur="handleBlur" class="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-box min-w-full max-h-40 overflow-auto flex flex-col flex-nowrap" :class="props.dropdownClasses">
		<li v-if="props.allowEmpty" @click="value = null" :class="[props.optionClasses]">
			<a class="p-2 w-full" :class="[{'active': value == null}, {'whitespace-nowrap': !props.wrapOptions}]" v-html="props.emptyContent"></a>
		</li>
		<li v-for="optionRow in processedOptions" :key="optionRow.key" @click="value = optionRow.key"  class="" :class="[props.optionClasses]">
			<a v-html="props.render(optionRow.data)" class="p-2 w-full" :class="[{'active': optionRow.key == value}, {'whitespace-nowrap': !props.wrapOptions}]"></a>
		</li>
		<li class="p-2 w-full" v-if="processedOptions.length == 0" :class="[props.optionClasses]">
			No results
		</li>
	</ul>
</div>
</template>