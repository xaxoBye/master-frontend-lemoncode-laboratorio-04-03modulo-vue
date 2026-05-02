<template>
  <header>
    <h1>Planificador menús <span class="titulo-largo">semanal</span></h1>
    <nav class="grupo-botones">
      <button @click="crearNavegar">Planificador</button>
      <button @click="handleNav('favoritos')">Favoritos</button>
      <button @click="handleNav('configuracion')">Configuración</button>
      <button @click="handleNav('about')">Acerca de</button>
    </nav>
  </header>
</template>

<script setup lang="ts">
import router from '@/router';
import { useListsStore } from '@/stores/lists';
import { DiasSemana } from '@/types';

const listsStore = useListsStore();

const handleNewList = async () => {
  const newList = await listsStore.createList('platano', DiasSemana.LUNES, 'comida');
  console.log(newList);
};

const handleNav = (link: string) => {
  router.push(`/${link}`);
};

const crearNavegar = async () => {
  await handleNewList();
  handleNav('');
};
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between; /* Mete el H1 a la izquierda y el .grupo-botones a la derecha */
  align-items: center; /* Centra verticalmente todo */
  padding: 1rem; /* Espacio interior */
  padding-top: 0;
  margin-top: 0;
  width: 100%;
  height: 60px;
  border-radius: 0px 0px 20px 20px;
  background-color: #0066ff;
  flex-wrap: wrap; /* Permite que los elementos bajen de línea si no caben */
}
header h1 {
  height: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
}

.grupo-botones {
  display: flex;
  gap: 5px;
  align-items: center;
  margin: 0;
  padding: 0;
}

/* --- Responsive para Móvil --- */
/* Suponemos móvil a partir de 768px de ancho (pantallas pequeñas) */
@media (max-width: 768px) {
  header {
    flex-direction: column;
    align-items: flex-start; /* Alinea todo a la izquierda */
    gap: 15px;
  }

  .grupo-botones {
    flex-direction: column;
    width: 100%;
  }

  .grupo-botones button {
    width: 100%;
  }

  .titulo-largo {
    display: none;
  }
}
</style>
