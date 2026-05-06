<template>
  <header>
    <h1>{{ tituloPagina }}</h1>
    <nav class="grupo-botones">
      <button v-if="rutaActual !== '/'" @click="crearNavegar" class="btn-nav">Planificador</button>
      <button v-if="rutaActual !== '/favoritos'" @click="handleNav('favoritos')" class="btn-nav">
        Favoritos
      </button>
      <button
        v-if="rutaActual !== '/configuracion'"
        @click="handleNav('configuracion')"
        class="btn-nav"
      >
        Configuración
      </button>
      <button v-if="rutaActual !== '/about'" @click="handleNav('about')" class="btn-nav">
        Acerca de
      </button>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import router from '@/router';
import { useRoute, useRouter } from 'vue-router';
import { useListsStore } from '@/stores/lists';
import { DiasSemana, MomentoComida } from '@/types';
import type { ConfiguracionTitulo } from '@/types';

const route = useRoute();
const useRouterRef = useRouter();

const rutaActual = computed(() => route.path);

const titulosPorRuta: Record<string, ConfiguracionTitulo> = {
  '/': {
    titulo: 'Planificador menús',
    mostrarSubtitulo: true,
    nombreBoton: 'Planificador',
  },
  '/favoritos': {
    titulo: 'Favoritos',
    mostrarSubtitulo: false,
    nombreBoton: 'Favoritos',
  },
  '/configuracion': {
    titulo: 'Configuración',
    mostrarSubtitulo: false,
    nombreBoton: 'Configuración',
  },
  '/about': {
    titulo: 'Acerca de...',
    mostrarSubtitulo: false,
    nombreBoton: 'Acerca de',
  },
};

// ✅ Título dinámico según ruta
const tituloPagina = computed(() => {
  const config = titulosPorRuta[rutaActual.value];

  // Si no hay configuración para esta ruta, usar genérico
  return config?.titulo || 'Planificador menús';
});

// ✅ Mostrar/ocultar "semanal" sub-título
const mostrarSubtitulo = computed(() => {
  const config = titulosPorRuta[rutaActual.value];
  return config?.mostrarSubtitulo || false;
});

// ✅ Nombre de la página actual (para indicador opcional)
const nombrePaginaActual = computed(() => {
  const config = titulosPorRuta[rutaActual.value];
  return config?.nombreBoton || '';
});

const listsStore = useListsStore();

const handleNewList = async () => {
  const newList = await listsStore.createList('platano', DiasSemana.LUNES, MomentoComida.comida);
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

.btn-nav {
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 600;

  background-color: rgba(255, 255, 255, 0.15); /* Semi-transparente */
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;

  cursor: pointer;
  transition: all 0.25s ease;

  user-select: none;
  outline: none;
}

.btn-nav:hover {
  background-color: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-nav:active {
  transform: translateY(0);
  box-shadow: none;
}

.btn-nav:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.6);
  outline-offset: 2px;
}

/* --- Responsive para Móvil --- */
/* Suponemos móvil a partir de 768px de ancho (pantallas pequeñas) */
@media (max-width: 830px) {
  header {
    flex-direction: column;
    align-items: flex-start; /* Alinea todo a la izquierda */
    justify-content: flex-start;
    gap: 15px;
    box-sizing: border-box;
    height: auto;
  }

  .grupo-botones {
    flex-direction: column;
    width: 100%;
  }

  .grupo-botones button {
    width: 100%;
  }
}
</style>
