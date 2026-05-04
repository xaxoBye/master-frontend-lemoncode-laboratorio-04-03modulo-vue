<template>
  <LeyendaMenu />
  <div class="tabla-wrapper">
    <TablaFavoritos />
  </div>
</template>

<script setup lang="ts">
import TablaFavoritos from '@/components/TablaFavoritos.vue';
import LeyendaMenu from '@/components/LeyendaMenu.vue';
</script>

<style scoped>
.tabla-wrapper {
  /* ← Centrado horizontal y vertical */
  display: flex;
  justify-content: center; /* Centra horizontalmente */
  align-items: flex-start; /* Alinea arriba (puedes usar 'center' para vertical también) */

  padding: 10px;
  margin: 0px;
  overflow-x: auto; /* Scroll si es muy ancha */
  background-color: #1a2229;
  width: 100%;
}

/* Responsive */
@media (min-width: 768px) {
  .tabla-wrapper {
    padding: 30px 20px;
    overflow-x: auto;
  }
}
</style>
