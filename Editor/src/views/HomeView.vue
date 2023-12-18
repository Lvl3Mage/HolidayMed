<script>
  import {useApartments} from '../stores/Apartments.js'
  import {useObjectManager} from '../stores/ObjectManager.js'
</script>
<script setup>

  let ApartmentManager = useApartments();
  let ObjectManager = useObjectManager();
</script>

<template>
  <main>
    <div class="" v-for="apartment in ApartmentManager.apartments" :key="apartment.id">
      {{apartment.id}}
    </div>
  </main>
</template>
