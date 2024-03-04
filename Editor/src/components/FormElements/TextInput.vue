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
			}
		},
		methods: {
			isValid(){
				return this.validate(this.value);
			}
		
		}
	}

</script>
<template>
	<label class="form-control w-full max-w-xs">
		<div class="label" v-if="$slots.label">
			<span class="label-text">
				<slot name="label"></slot>
			</span>
		</div>
		<!-- @blur="$emit('submit', value)" @keyup.enter="$emit('submit', value)" -->
		<input  v-model="value" type="text" :placeholder="placeholder" :class="{'input-error' : !validate(value)}" class="input input-bordered w-full max-w-xs" />
		<div class="label" v-if="!validate(value)">
			<span class="label-text-alt text-error">
				<slot name="invalid"></slot>
			</span>
		</div>
	</label>
</template>
<style scoped lang="scss">
</style>