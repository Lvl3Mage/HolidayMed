<script setup>
	import {useObjectCache} from '@/stores/ObjectCache'
	import {useObjectManager} from '@/stores/ObjectManager'
	import {useUIManagement} from '@/stores/UIManagment.js'
	import {useAPIAccess} from '@/stores/APIAccess.js'
	import { ref } from 'vue'
	const APIAccess = useAPIAccess();
	const ObjectCache = useObjectCache();
	const ObjectManager = useObjectManager();
	const UIManagment = useUIManagement();

	import TableDataDisplay from '@/components/TableDataDisplay.vue';
	import CacheSegmentRenderer from '@/components/CacheSegmentRenderer.vue';
	import SelectInput from '@/components/FormElements/SelectInput.vue';
	
	function ViewObj(objectType, objectId){
		UIManagment.OpenEditObjectModal(objectType, objectId).then((result) => {
			console.log(result.code, result.data);
		}).catch((error) => {
			console.error(error.code, error.data);
		});
	}
	function CreateObj(objectType){
		UIManagment.OpenCreateObjectModal(objectType).then((result) => {
			console.log(result.code, result.data);
		}).catch((error) => {
			console.error(error.code, error.data);
		});
	}
	// APIAccess.GetREST('/options/dictionary-es').then(data => {
		
	// 	console.error('dictionary-es',data);
	// }).catch(error => {
	// 	console.error(error);
	// });
</script>

<template>
	<main>
		<div class="container">
			<div class="flex flex-wrap gap-12">
				<CacheSegmentRenderer class="card card-bordered card-compact basis-1/3 grow lg:basis-full bg-base-100 shadow-xl" type="order" :renderWhenLoading="false">
					<div class="card-body">
						<h2 class="card-title mb-2">Ultimos pedidos</h2>
						<div class="grow flex flex-col justify-between">
							<TableDataDisplay :rows="ObjectCache.GetSegmentRows('order')" :compact="true" :showRowNumbers="true" :rowsPerPage="10" :fields="[
								{
									displayName: 'Titulo',
									render: (object) => object.title.rendered,
									getSortValue: (object) => object.title.rendered,
									getSearchValue: (object) => object.title.rendered,
								},
								{
									displayName: 'Estado',
									render: (object) => {
										const status = object.acf.order_status;
										switch(status){
											case 'initial':
												return `<span class='badge badge-neutral'>Inicial</span>`;
											case 'pending':
												return `<span class='badge badge-ghost'>Pendiente</span>`;
											case 'completed':
												return `<span class='badge badge-success'>Completado</span>`;
											case 'canceled':
												return `<span class='badge badge-error'>Cancelado</span>`;
											case 'confirmed':
												return `<span class='badge badge-success'>Confirmado</span>`;
											default:
												return `<span class='badge'>${status}</span>`;
										}
									},
									getSortValue: (object) => object.title.rendered,
									getSearchValue: (object) => object.title.rendered,
								},
							]"
							:actions="[
								{
									render: (object) => `<button class='btn btn-info btn-xs'>Edit</button>`,
									onClick: (object) => ViewObj('order', object.id),
								},
							]"/>	
							
						</div>
					</div>
				</CacheSegmentRenderer>

			</div>
			<!-- <div class="btn btn-success" @click="UIManagement.OpenCreateObjectModal('building')">Create Building</div> -->
			
		</div>
		<!-- <SelectInput v-model="selectedApartment" :allowEmpty="true" :options="ObjectCache.GetSegmentData('apartment')" :render="ap=>ap.title.rendered" :getSearchValue="ap=>ap.title.rendered"></SelectInput> -->
	<!-- 	<img :src="filePath" alt="">
		<label class="form-control w-full max-w-xs">
			<div class="label">
				<span class="label-text">Pick a file</span>
			</div>
			<input type="file" class="file-input file-input-bordered w-full max-w-xs" accept="image/png, image/jpeg, image/jpg" @change="LoadFile"/>
		</label>
		<div class="btn" @click="CreateObj('apartment')">Create</div> -->
		
	</main>
</template>
