<script >
	export default{
		emits:['change','update:modelValue'],
		props: {
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

		},
		data() {
			return {
				//state goes here
			}
		},
		computed: {
			value: {
				get() {
					return this.modelValue
				},
				set(value) {
					this.$emit('update:modelValue', value);
					this.$emit('change');
				}
			},
			valid(){
				if(this.validate != undefined){
					return this.validate(this.value);
				}
				return true;
			}
		},
		methods: {
		
		},
	}

</script>
<template>
	<label class="input input-bordered flex items-center gap-2" :class="{'input-error' : !valid && displayValidation}">
		<slot name="before"></slot>
		<input v-model="value" :type="type" :placeholder="placeholder"  class="grow" />
		<slot name="after"></slot>
	</label>
</template>
<style scoped lang="scss">
</style>