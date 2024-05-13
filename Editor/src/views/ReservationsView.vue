<script setup>
	import {useObjectCache} from '@/stores/ObjectCache'
	import {useObjectManager} from '@/stores/ObjectManager'
	import {useUIManagment} from '@/stores/UIManagment.js'
	import {useAPIAccess} from '@/stores/APIAccess.js'
	import { ref } from 'vue'
	const APIAccess = useAPIAccess();
	const ObjectCache = useObjectCache();
	const ObjectManager = useObjectManager();
	const UIManagment = useUIManagment();

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
				<CacheSegmentRenderer class="card card-bordered card-compact basis-1/3 grow lg:basis-full bg-base-100 shadow-xl" type="media" :renderWhenLoading="false">
					<div class="card-body">
						<h2 class="card-title mb-2">Ultimas reservas</h2>
						<div class="grow flex flex-col justify-between">
							<TableDataDisplay :rows="ObjectCache.GetSegmentRows('reservation')" :compact="true" :showRowNumbers="true" :rowsPerPage="10" :fields="[
								{
									displayName: 'ID',
									render: (object) => object.id,
									getSortValue: (object) => object.id,

								},
								{
									displayName: 'Title',
									render: (object) => object.title.rendered,
									getSortValue: (object) => object.title.rendered,
									getSearchValue: (object) => object.title.rendered,
								},
								{
									displayName: 'Apartment',
									render: (object) => {
										let apartment = ObjectCache.GetObject('apartment', object.acf.apartment);
										return `<span class='${apartment ? 'link' : ''}'>
										${apartment ? apartment.title.rendered : 'Apartment not found'}
										</span>`;
									},
									onClick: (object) => ViewObj('apartment', object.acf.apartment),
									getSearchValue: (object) => ObjectCache.GetObject('apartment', object.acf.apartment) ? ObjectCache.GetObject('apartment', object.acf.apartment).title.rendered : '',
								},
							]"
							:actions="[
								{
									render: (object) => `<button class='btn btn-info btn-xs'>Edit</button>`,
									onClick: (object) => ViewObj('reservation', object.id),
								},
							]"/>	
							
						</div>
					</div>
				</CacheSegmentRenderer>

			</div>
			<div class="btn btn-success" @click="UIManagment.OpenCreateObjectModal('building')">Create Building</div>
			
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
