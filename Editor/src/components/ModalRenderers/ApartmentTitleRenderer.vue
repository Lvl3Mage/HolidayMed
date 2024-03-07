<script setup>
	const props = defineProps({
		objectData: {
			type: Object,
			required: true,
		},
	});

</script>
<template>
	{{props.objectData.acf.inner_id}}
</template>