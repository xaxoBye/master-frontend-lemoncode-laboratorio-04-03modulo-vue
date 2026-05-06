<template>
  <LeyendaMenu />
  <div class="tabla-wrapper">
    <TablaFavoritos />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useMenuStore } from '@/stores/menuStore';
import TablaFavoritos from '@/components/TablaFavoritos.vue';
import menuSemanal from '@/data/comidas.json';

const store = useMenuStore();

onMounted(() => {
  const datosGuardados = localStorage.getItem('menu-semanal-favoritos');

  if (datosGuardados) {
    try {
      const datosParseados = JSON.parse(datosGuardados);
      store.cargarPlatos(datosParseados);
      console.log('Datos recuperados de localStorage');
    } catch (error) {
      console.error('❌ Error leyendo localStorage, usando JSON por defecto', error);
      store.cargarPlatos(menuSemanal);
    }
  }
});
</script>

<style scoped>
.tabla-wrapper {
  /* ← Centrado horizontal y vertical */
  display: block;

  padding: 10px;
  margin: 0px;
  overflow-x: auto; /* Scroll si es muy ancha */
  overflow-y: visible;
  background-color: #1a2229;
  width: 100%;
  -webkit-overflow-scrolling: touch;
}

/* Responsive */
@media (min-width: 768px) {
  .tabla-wrapper {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 30px 20px;
    overflow-x: auto;
  }
}
</style>
