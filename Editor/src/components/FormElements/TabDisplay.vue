<script setup>
import {reactive, ref, useSlots} from "vue";
import {useValidationGroup} from "@/components/FormElements/ValidationGroup";
	const props = defineProps({
		tabs: {
			type: Object,
			required: true,
			default: {},
		},
	});
	const slots = useSlots()
	const activeTab = ref(Object.keys(props.tabs)[0]);
	const validationGroups = {};
	for (const tabName of Object.keys(props.tabs)){
		validationGroups[tabName] = reactive(useValidationGroup());
	}
	console.log(slots)
	defineExpose({
		activeTab,
		isValid : () => Object.keys(validationGroups).every(tabName => validationGroups[tabName].isValid)
	});
</script>

<template>
	<div role="tablist" class="tabs tabs-lifted">
		<template v-for="tabName in Object.keys(tabs)">
			<a role="tab" class="tab" :class="{'tab-active': activeTab === tabName, 'text-error': !validationGroups[tabName].isValid()}" @click="activeTab = tabName">{{tabs[tabName]?.name || tabName}}</a>
			<div role="tabpanel" class="tab-content">
				<slot :name="tabName" :validationGroup="validationGroups[tabName]"></slot>
			</div>
		</template>
	</div>
</template>