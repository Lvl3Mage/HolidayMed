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
			}
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
			}
		},
		methods: {
			isValid(){
				if(this.validate != undefined){
					return this.validate(this.value);
				}
				return true;
			},
			classesSet(){
				this.class != null;
			}
		
		},
	}

</script>
<template>
	<label class="form-control" :class="{'w-full max-w-xs': !$attrs.class}">
		<div class="label" v-if="$slots.label">
			<span class="label-text">
				<slot name="label"></slot>
			</span>
		</div>


		<label class="input input-bordered flex items-center gap-2" :class="{'input-error' : !isValid() && displayValidation}">
			<slot name="before"></slot>
			<input v-model="value" :type="type" :placeholder="placeholder"  class="grow" />
			<slot name="after"></slot>
		</label>
		<!-- @blur="$emit('submit', value)" @keyup.enter="$emit('submit', value)" -->
		<div class="label" v-if="$slots.invalid && !isValid() && displayValidation">
			<span class="label-text-alt text-error">
				<slot name="invalid"></slot>
			</span>
		</div>
	</label>
</template>
<style scoped lang="scss">
</style>