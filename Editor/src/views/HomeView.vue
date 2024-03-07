<script setup>
  import {useObjectManager} from '@/stores/ObjectManager'
  import {useUIState} from '@/stores/UIState.js'
  import {useAPIAccess} from '@/stores/APIAccess.js'
  import { ref } from 'vue'
  let APIAccess = useAPIAccess();
  let ObjectManager = useObjectManager();
  let UIState = useUIState();
  let apartments = ref([])

  // APIAccess.DebugRequest('/apartments', {
  //   title: 'DebugApartment',
  //   status: 'publish',
  // }).then(result => {
  //   console.log(result);
     
  // }).catch(error => {
  //   console.error(error);
  // })
  ObjectManager.GetObjects('apartment', '_fields=id,title').then(result => {
    apartments.value = Object.assign({}, ...result.map((element) => ({[element.id]: element})));
  }).catch(error => {
    console.error(error);
  })
  function ViewObj(objectType, objectId){
    UIState.OpenObjectModal(objectType, objectId).then((result) => {
      console.log(result.code, result.data);
    }).catch((error) => {
      console.error(error.code, error.data);
    })
  }


 
</script>

<template>
  <main>
    <div class="" v-for="(apartment, apartmentId) in apartments" :key="apartmentId" @click="ViewObj('apartment',apartmentId)">
      {{apartmentId}} : {{apartment.title.rendered}}
    
    </div>
  </main>
</template>
