<script setup>
	import {useObjectCache} from '@/stores/ObjectCache'
	import {useObjectManager} from '@/stores/ObjectManager'
	import {useUIManagement} from '@/stores/UIManagment.js'
	import {useAPIAccess} from '@/stores/APIAccess.js'
	import { ref } from 'vue'
	const APIAccess = useAPIAccess();
	const ObjectCache = useObjectCache();
	const ObjectManager = useObjectManager();
	const UIManagement = useUIManagement();

	import TableDataDisplay from '@/components/TableDataDisplay.vue';
	import CacheSegmentRenderer from '@/components/CacheSegmentRenderer.vue';
	import SelectInput from '@/components/FormElements/SelectInput.vue';
	import TabDisplay from "@/components/FormElements/TabDisplay.vue";
	import Input from "@/components/FormElements/Input.vue"
	import {formValueValidation} from "@/Utils";
	
	function ViewObj(objectType, objectId){
		UIManagement.OpenEditObjectModal(objectType, objectId).then((result) => {
			console.log(result.code, result.data);
		}).catch((error) => {
			console.error(error.code, error.data);
		});
	}
	function CreateObj(objectType){
		UIManagement.OpenCreateObjectModal(objectType).then((result) => {
			console.log(result.code, result.data);
		}).catch((error) => {
			console.error(error.code, error.data);
		});
	}
	// const filePath = ref('');
	// function LoadFile(e){
	// 	const file = e.target.files[0];
	// 	console.log(file)
	// 	if(file == undefined){
	// 		filePath.value = '';
	// 		return;
	// 	}
	// 	filePath.value = URL.createObjectURL(file);
	// 	ObjectManager.RunUpload('media', file).then(result => {
	// 		console.log(result);
	// 	}).catch(error => {
	// 		console.error(error);
	// 	});
	// }
	// function RemoveImage(imageId){
	// 	const toast = UIManagement.OpenToast({appearance: 'loading', text: 'Removing image...'});
	// 	ObjectManager.DeleteObject('media', imageId).then(result => {
	// 		console.log(result);
	// 		toast.CloseToast();
	// 		UIManagement.OpenToast({appearance: 'success', text: 'Image removed!', closeOnClick:true, lifetime:2000});
	// 	}).catch(error => {
	// 		console.error(error);
	// 		UIManagement.OpenToast({appearance: 'error', text: `Image could not be removed!`, closeOnClick:true, lifetime:2000});
	// 	})
	// 	.finally(() => {
	// 		toast.CloseToast();
	// 	});
	// }
	function GetApartmentBuilding(object){
		return ObjectCache.GetObject('building', object.acf.building);
	}
	function RenderApartmentBuilding(object){
		const building = GetApartmentBuilding(object);
		if(!building){
			return `<span>Building not found</span>`;
		}
		return `<span class='link'>
			${building.title.rendered}
		</span>`;
	}
	function ViewBuilding(building) {
		if (building) {
			ViewObj('building', building.id);
		}
	}
</script>

<template>
	<main>
		<div class="container">
			<div class="flex flex-wrap gap-12">
				{{APIAccess.ongoingRequests}}
				<CacheSegmentRenderer :types="['apartment', 'building']" class="card card-bordered card-compact basis-full bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="card-title mb-2">Apartamentos</h2>
						<div class="grow flex flex-col justify-between">
							<TableDataDisplay :rows="ObjectCache.GetSegmentRows('apartment')" :compact="true" :showRowNumbers="true" :rowsPerPage="10" :fields="[
								{
									displayName: 'Inner ID',
									render: (object) => object.acf.inner_id,
								},
								{
									displayName: 'Title',
									render: (object) => object.acf.title,
									getSortValue: (object) => object.acf.title,
									getSearchValue: (object) => object.acf.title,
								},
								{
									displayName: 'Building',
									render: RenderApartmentBuilding,
									onClick: (object) => ViewBuilding(GetApartmentBuilding(object)),
									getSearchValue: (object) => ObjectCache.GetSegmentRows('building'),
								},
								{
									displayName: 'Published',
									render: (object) => `<div class='flex items-center'><div class='w-2 h-2 rounded-full ${object.acf.published ? 'bg-success' : 'bg-warning'}'><div/></div> `,

								}
							]"
							:actions="[
								{
									render: (object) => `<button class='btn btn-info btn-xs'>Edit</button>`,
									onClick: (object) => ViewObj('apartment', object.id),
								},
							]"/>
						</div>
						 <div class="btn btn-success" @click="UIManagement.OpenCreateObjectModal('apartment')">Nuevo apartamento</div> 
					</div>
				</CacheSegmentRenderer>
				<CacheSegmentRenderer :types="['building']" class="card card-bordered card-compact basis-full bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="card-title mb-2">Edificios</h2>
						<div class="grow flex flex-col justify-between">
							<TableDataDisplay :rows="ObjectCache.GetSegmentRows('building')" :compact="true" :showRowNumbers="true" :rowsPerPage="10" :fields="[
								{
									displayName: 'Title',
									render: (object) => object.acf.title,
									getSortValue: (object) => object.acf.title,
									getSearchValue: (object) => object.acf.title,
								},
							]"
							:actions="[
								{
									render: (object) => `<button class='btn btn-info btn-xs'>Edit</button>`,
									onClick: (object) => ViewObj('building', object.id),
								},
							]"/>
						</div>
						<div class="btn btn-success" @click="UIManagement.OpenCreateObjectModal('building')">Nuevo edificio</div>
					</div>
				</CacheSegmentRenderer>

			</div>
			
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
