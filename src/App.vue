<template>
  <MainHeader />
  <RouterView />
  <p>
    Si quieres comenzar la semana por otro día puedes arrastrarlo en el primer lugar de la lista. O
    ir a Configuración.
  </p>
  <h1>Video 3 - 0h:00min</h1>
</template>

<script setup lang="ts">
import MainHeader from '@/components/MainHeader.vue';
import { RouterView } from 'vue-router';
</script>
