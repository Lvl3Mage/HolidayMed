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
	const filePath = ref('');
	function LoadFile(e){
		const file = e.target.files[0];
		console.log(file)
		if(file == undefined){
			filePath.value = '';
			return;
		}
		filePath.value = URL.createObjectURL(file);
		ObjectManager.UploadFile('media', file).then(result => {
			console.log(result);
		}).catch(error => {
			console.error(error);
		});
	}
	function RemoveImage(imageId){
		const toast = UIManagment.OpenToast({appearance: 'loading', text: 'Removing image...'});
		ObjectManager.DeleteObject('media', imageId).then(result => {
			console.log(result);
			toast.CloseToast();
			UIManagment.OpenToast({appearance: 'success', text: 'Image removed!', closeOnClick:true, lifetime:2000});
		}).catch(error => {
			console.error(error);
			UIManagment.OpenToast({appearance: 'error', text: `Image could not be removed!`, closeOnClick:true, lifetime:2000});
		})
		.finally(() => {
			toast.CloseToast();
		});
	}
</script>

<template>
	<main>

		<TableDataDisplay :rows="ObjectCache.GetSegmentRows('apartment')" :compact="true" :showRowNumbers="true" :rowsPerPage="5" :fields="[
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
				displayName: 'Inner ID',
				render: (object) => object.acf.inner_id,
			},
			{
				displayName: 'Group',
				render: (object) => `<span class='${ObjectCache.GetObject('group', object.acf.group) ? 'link' : ''}'>${
					ObjectCache.GetObject('group', object.acf.group) ? ObjectCache.GetObject('group', object.acf.group).title.rendered : 'Group not found'
				}</span>`,
				onClick: (object) => ViewObj('group', object.acf.group),
				getSearchValue: (object) => ObjectCache.GetObject('group', object.acf.group) ? ObjectCache.GetObject('group', object.acf.group).title.rendered : '',
			},
		]"
		:actions="[
			{
				render: (object) => `<button class='btn btn-info btn-xs'>Edit</button>`,
				onClick: (object) => ViewObj('apartment', object.id),
			},
		]"/>


		<img :src="filePath" alt="">
		<label class="form-control w-full max-w-xs">
			<div class="label">
				<span class="label-text">Pick a file</span>
			</div>
			<input type="file" class="file-input file-input-bordered w-full max-w-xs" accept="image/png, image/jpeg, image/jpg" @change="LoadFile"/>
		</label>
		<div class="btn" @click="CreateObj('apartment')">Create</div>
		<div class="flex flex-wrap gap-5 justify-around">
			<div class="card w-96 bg-base-100 shadow-xl" v-for="image in ObjectCache.GetSegmentData('media')" :key="image.id">
				<!-- <figure><img :src="image.link" alt="" class="w-full aspect-video object-cover object-center"/></figure> -->
				<div class="card-body">
					<h2 class="card-title mt-auto justify-center">{{image.title.rendered}}</h2>
					<div class="text-error">
						<button class="btn btn-circle" @click="RemoveImage(image.id)">
						  <i class="fa-solid fa-trash"></i>
						</button>
					</div>
				</div>
			</div>
		</div>
	</main>
</template>
