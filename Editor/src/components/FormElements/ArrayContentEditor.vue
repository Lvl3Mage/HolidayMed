<script setup>

	import {ref, computed, shallowReactive, watch, reactive} from "vue";
	import { v4 as uuidv4 } from 'uuid';
	import {useValidationGroup} from "@/components/FormElements/ValidationGroup";
	
	const props = defineProps({
		value: {
			type: Array,
			require: true,
		},
		elementConstructor: {
			type: Function,
			require: true,
		},
		validationGroup: {
			type: Object,
			require: false,
		},
		itemClass: {
			type: String,
			require: false,
		},
	});
	const validationGroup = reactive(useValidationGroup());
	function AddElement(){
		props.value.push(props.elementConstructor());
	}
	
	
	const uniqueId = uuidv4();
	defineExpose({
		isValid : validationGroup?.isValid || (() => true),
		uniqueId,
	});
</script>

<template>
	<div class="">
		<div class="group/list-item" v-for="(item,index) in value" :key="index">
			<div class="flex">
				
				
				<div class="w-0 grow" :class="[itemClass ? itemClass : 'join join-horizontal sm:join-vertical']">
					<slot :item="item" :index="index"></slot>
				</div>

				<div class="flex justify-center items-center p-2">
					<div class="btn btn-warning btn-sm btn-circle" @click="value.splice(index,1)">
						<i class="fa-solid fa-minus"></i>
					</div>
				</div>
			</div>
			<div class="divider group-last/list-item:hidden"></div> 
		</div>
	</div>
	<div class="flex justify-center items-center gap-3 mt-4">
		<div class="btn btn-secondary btn-circle text-xl" @click="AddElement()">
			<i class="fa-solid fa-plus"></i>
		</div>
	</div>
</template>