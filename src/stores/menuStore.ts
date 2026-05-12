// src/stores/menuStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { DiasSemana, MomentoComida } from '@/types';
import type { ComidaAsignada, Asignacion } from '@/types';

export const useMenuStore = defineStore('menu', () => {
  const platos = ref<ComidaAsignada[]>([]);
  const cambiosPendientes = ref<number>(0);
  const isGuardando = ref<boolean>(false);
  const showExitoGuardado = ref<boolean>(false);
  const showErrorGuardado = ref<boolean>(false);
  const mensajeToast = ref<string>('');
  const tipoToast = ref<'exito' | 'error' | 'info'>('info');
  const esAutoGuardado = ref<boolean>(false);

  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  const platosOrdenados = computed(() => {
    return [...platos.value].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }),
    );
  });

  const hayCambios = computed(() => cambiosPendientes.value > 0);
  const totalPlatos = computed(() => platos.value.length);

  function cargarPlatos(platosACargar: ComidaAsignada[]): void {
    platos.value = platosACargar;
    console.log(`📥 Store: Cargados ${platosACargar.length} platos`);
  }

  function incluirNuevoPlato(
    nombre: string,
    dia: DiasSemana,
    momento: MomentoComida,
  ): ComidaAsignada {
    // Crear nueva asignación
    const nuevaAsignacion: Asignacion = {
      dia,
      momento,
      favorito: false,
    };

    const nuevoPlato: ComidaAsignada = {
      id: generarIdUnico(),
      nombre: nombre.trim(),
      asignaciones: [nuevaAsignacion],
    };

    platos.value.push(nuevoPlato);

    incrementarCambios();

    console.log(`✅ Store: Plato "${nombre}" creado (ID: ${nuevoPlato.id})`);

    return nuevoPlato;
  }

  function eliminarPlato(platoId: string): boolean {
    const indice = platos.value.findIndex((p) => p.id === platoId);

    if (indice === -1) {
      console.warn(`⚠️ Store: No se encontró plato con ID ${platoId}`);
      return false;
    }

    const platoEliminado = platos.value.splice(indice, 1)[0];

    if (!platoEliminado) {
      return false;
    }
    incrementarCambios();

    console.log(`🗑️ Store: Plato "${platoEliminado.nombre}" eliminado`);

    return true;
  }

  function toggleFavorito(plato: ComidaAsignada, dia: DiasSemana, momento: MomentoComida): void {
    const asignacion = buscarAsignacionInterna(plato, dia, momento);

    if (asignacion) {
      asignacion.favorito = !asignacion.favorito;
      incrementarCambios();

      console.log(
        `⭐ Store: Favorito ${asignacion.favorito ? 'activado' : 'desactivado'} - ${plato.nombre} (${dia}/${momento})`,
      );
    }
  }

  function toggleAsignacion(plato: ComidaAsignada, dia: DiasSemana, momento: MomentoComida): void {
    const indiceAsignacion = plato.asignaciones.findIndex(
      (a) => a.dia === dia && a.momento === momento,
    );

    if (indiceAsignacion !== -1) {
      plato.asignaciones.splice(indiceAsignacion, 1);
      console.log(`❌ Store: Asignación eliminada - ${plato.nombre} (${dia}/${momento})`);
    } else {
      plato.asignaciones.push({
        dia,
        momento,
        favorito: false,
      });
      console.log(`✅ Store: Asignación creada - ${plato.nombre} (${dia}/${momento})`);
    }

    incrementarCambios();
  }

  function buscarAsignacion(
    plato: ComidaAsignada,
    dia: DiasSemana,
    momento: MomentoComida,
  ): Asignacion | undefined {
    return buscarAsignacionInterna(plato, dia, momento);
  }

  function resetCambiosPendientes(): void {
    const anterior = cambiosPendientes.value;
    cambiosPendientes.value = 0;
    esAutoGuardado.value = false;

    console.log(`🔄 Store: Cambios reseteados (${anterior} → 0)`);
  }

  async function guardarCambios(): Promise<void> {
    // Evitar guardados duplicados simultáneos
    if (isGuardando.value) {
      console.log('⏳ Store: Ya hay un guardado en progreso');
      return;
    }

    try {
      isGuardando.value = true;
      showErrorGuardado.value = false;
      showExitoGuardado.value = false;

      await new Promise((resolve) => setTimeout(resolve, 500));

      const datosJSON = JSON.stringify(platos.value);
      localStorage.setItem('menu-semanal-favoritos', datosJSON);

      showExitoGuardado.value = true;
      resetCambiosPendientes();

      console.log(`💾 Store: Guardados ${platos.value.length} platos en localStorage`);
      mostrarToastExito('¡Datos guardados correctamente!');

      setTimeout(() => {
        showExitoGuardado.value = false;
      }, 2000);
    } catch (error) {
      console.error('❌ Store: Error al guardar:', error);

      showErrorGuardado.value = true;
      mostrarToastError('Error al guardar los datos');

      setTimeout(() => {
        showErrorGuardado.value = false;
      }, 3000);
    } finally {
      isGuardando.value = false;
    }
  }

  function cargarDesdeLocalStorage(): boolean {
    try {
      const datosGuardados = localStorage.getItem('menu-semanal-favoritos');

      if (!datosGuardados) {
        console.log('ℹ️ Store: No hay datos en localStorage');
        return false;
      }

      const datosParseados: ComidaAsignada[] = JSON.parse(datosGuardados);

      if (!Array.isArray(datosParseados) || datosParseados.length === 0) {
        console.warn('⚠️ Store: Datos en localStorage inválidos');
        return false;
      }

      cargarPlatos(datosParseados);
      console.log(`✅ Store: Recuperados ${datosParseados.length} platos del storage`);

      return true;
    } catch (error) {
      console.error('❌ Store: Error leyendo localStorage:', error);
      return false;
    }
  }

  function resetEstado(): void {
    platos.value = [];
    cambiosPendientes.value = 0;
    esAutoGuardado.value = false;
  }

  function limpiarTodo(): void {
    resetEstado();
    isGuardando.value = false;

    guardarEstadoSilenciosamente();

    console.log('🧹 Store: Todos los datos eliminados');
    mostrarToastInfo('Datos eliminados');
  }

  function incrementarCambios(): void {
    cambiosPendientes.value++;
    console.log(`📊 Store: Cambios pendientes = ${cambiosPendientes.value}`);
  }

  function marcarComoAutoGuardado(): void {
    esAutoGuardado.value = true;
    cambiosPendientes.value = 0; // Resetear inmediatamente

    showExitoGuardado.value = true;

    setTimeout(() => {
      esAutoGuardado.value = false;
      showExitoGuardado.value = false;
    }, 2000);

    console.log('🤖 Store: Marcado como auto-guardado (badge oculto)');
  }

  function mostrarToast(
    mensaje: string,
    tipo: 'exito' | 'error' | 'info' = 'info',
    duracion: number = 3000,
  ): void {
    // Limpiar timer anterior si existe
    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    mensajeToast.value = mensaje;
    tipoToast.value = tipo;

    if (duracion > 0) {
      toastTimer = setTimeout(() => {
        mensajeToast.value = '';
        toastTimer = null;
      }, duracion);
    }
  }

  function mostrarToastExito(mensaje: string): void {
    mostrarToast(mensaje, 'exito');
  }

  function mostrarToastError(mensaje: string): void {
    mostrarToast(mensaje, 'error', 4000);
  }

  function mostrarToastInfo(mensaje: string): void {
    mostrarToast(mensaje, 'info');
  }

  function ocultarToast(): void {
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }
    mensajeToast.value = '';
  }

  function generarIdUnico(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback para navegadores antiguos
    return `plato-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  function buscarAsignacionInterna(
    plato: ComidaAsignada,
    dia: DiasSemana,
    momento: MomentoComida,
  ): Asignacion | undefined {
    return plato.asignaciones.find((a) => a.dia === dia && a.momento === momento);
  }

  function obtenerPlatos(dia: DiasSemana, momento: MomentoComida): ComidaAsignada[] {
    return platosOrdenados.value.filter((plato) =>
      plato.asignaciones.some(
        (asignacion) => asignacion.dia === dia && asignacion.momento === momento,
      ),
    );
  }

  function obtenerTodosPlatosDelDia(dia: DiasSemana): ComidaAsignada[] {
    return platosOrdenados.value.filter((plato) => plato.asignaciones.some((a) => a.dia === dia));
  }

  function guardarEstadoSilenciosamente(): void {
    try {
      const datosJSON = JSON.stringify(platos.value);
      localStorage.setItem('menu-semanal-favoritos', datosJSON);
      console.log(`💾 Store: Estado guardado silenciosamente (${platos.value.length} platos)`);
    } catch (error) {
      console.error('❌ Store: Error al guardar estado:', error);
    }
  }

  return {
    platos,
    cambiosPendientes,
    isGuardando,
    showExitoGuardado,
    showErrorGuardado,
    mensajeToast,
    tipoToast,
    esAutoGuardado,
    platosOrdenados,
    hayCambios,
    totalPlatos,
    cargarPlatos,
    incluirNuevoPlato,
    eliminarPlato,
    toggleFavorito,
    toggleAsignacion,
    buscarAsignacion,
    guardarCambios,
    cargarDesdeLocalStorage,
    limpiarTodo,
    incrementarCambios,
    resetCambiosPendientes,
    marcarComoAutoGuardado,
    mostrarToast,
    mostrarToastExito,
    mostrarToastError,
    mostrarToastInfo,
    ocultarToast,
    obtenerPlatos,
    obtenerTodosPlatosDelDia,
    guardarEstadoSilenciosamente,
  };
});
