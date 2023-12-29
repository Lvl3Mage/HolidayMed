<script>
  import {useObjectListManager} from '@/stores/ObjectListManager'
  import {useUIState} from '@/stores/UIState.js'
</script>
<script setup>

  let ObjectListManager = useObjectListManager();
  let UIState = useUIState();
</script>

<template>
  <main>
    <div class="" v-for="(apartment, apartmentId) in ObjectListManager.managedObjects['apartment']" :key="apartmentId" @click="UIState.OpenObjectModal('apartment',apartmentId)">
      {{apartmentId}}
    </div>
  </main>
</template>
