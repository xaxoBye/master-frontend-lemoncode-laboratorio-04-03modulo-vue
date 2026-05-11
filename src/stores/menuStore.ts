// src/stores/menuStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { DiasSemana, MomentoComida } from '@/types';
import type { ComidaAsignada, Asignacion } from '@/types';

/**
 * ============================================
 * STORE: menuStore (Pinia)
 *
 * Gestiona todo el estado del menú semanal:
 * - Platos y sus asignaciones
 * - Favoritos
 * - Persistencia en localStorage
 * - Estado UI (toasts, badges, etc.)
 *
 * Uso:
 * ```ts
 * const store = useMenuStore();
 * store.incluirNuevoPlato('Paella', DiasSemana.LUNES, MomentoComida.comida);
 * ```
 * ============================================
 */
export const useMenuStore = defineStore('menu', () => {
  // ============================================
  // 🔴 STATE: Estado Reactivo
  // ============================================

  /** Lista completa de platos con sus asignaciones */
  const platos = ref<ComidaAsignada[]>([]);

  /** Contador de cambios pendientes (para el badge) */
  const cambiosPendientes = ref<number>(0);

  /** Estado de carga durante guardado */
  const isGuardando = ref<boolean>(false);

  /** Mostrar animación de éxito tras guardar */
  const showExitoGuardado = ref<boolean>(false);

  /** Mostrar estado de error tras fallo */
  const showErrorGuardado = ref<boolean>(false);

  /** Mensaje del toast actual */
  const mensajeToast = ref<string>('');

  /** Tipo de toast: éxito, error o info */
  const tipoToast = ref<'exito' | 'error' | 'info'>('info');

  /**
   * Flag especial: indica si el último guardado fue automático
   * (ej: al crear un plato desde el formulario)
   * Cuando es true, el badge NO debe aparecer
   */
  const esAutoGuardado = ref<boolean>(false);

  /** Timer para ocultar toast automáticamente */
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  // ============================================
  // 🟢 GETTERS: Computados (Derivados del State)
  // ============================================

  /**
   * Platos ordenados alfabéticamente
   * Usado en datalist y tablas
   */
  const platosOrdenados = computed(() => {
    return [...platos.value].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }),
    );
  });

  /**
   * ¿Hay cambios pendientes por guardar?
   * Para habilitar/deshabilitar botón guardar
   */
  const hayCambios = computed(() => cambiosPendientes.value > 0);

  /**
   * Total de platos en el menú
   */
  const totalPlatos = computed(() => platos.value.length);

  // ============================================
  // 🔵 ACTIONS: Métodos que Modifican el State
  // ============================================

  // ============================================
  // 👆 GESTIÓN DE PLATOS (CRUD)
  // ============================================

  /**
   * Cargar platos en el store (reemplaza completamente)
   * Usado al iniciar la app desde localStorage o JSON
   *
   * @param platosACargar - Array de platos a cargar
   */
  function cargarPlatos(platosACargar: ComidaAsignada[]): void {
    platos.value = platosACargar;
    console.log(`📥 Store: Cargados ${platosACargar.length} platos`);
  }

  /**
   * Incluir un nuevo plato en el menú
   *
   * @param nombre - Nombre del plato
   * @param dia - Día de la semana asignado
   * @param momento - Comida o cena
   * @returns El objeto del plato creado
   */
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
      fechaAsignacion: new Date().toISOString(),
    };

    // Crear objeto plato completo
    const nuevoPlato: ComidaAsignada = {
      id: generarIdUnico(),
      nombre: nombre.trim(),
      asignaciones: [nuevaAsignacion],
      fechaCreacion: new Date().toISOString(),
    };

    // Añadir al array reactivo
    platos.value.push(nuevoPlato);

    // Incrementar contador de cambios pendientes
    incrementarCambios();

    console.log(`✅ Store: Plato "${nombre}" creado (ID: ${nuevoPlato.id})`);

    return nuevoPlato;
  }

  /**
   * Eliminar un plato por su ID
   *
   * @param platoId - ID del plato a eliminar
   * @returns true si se eliminó, false si no existía
   */
  function eliminarPlato(platoId: string): boolean {
    const indice = platos.value.findIndex((p) => p.id === platoId);

    if (indice === -1) {
      console.warn(`⚠️ Store: No se encontró plato con ID ${platoId}`);
      return false;
    }

    const platoEliminado = platos.value.splice(indice, 1)[0];
    incrementarCambios();

    console.log(`🗑️ Store: Plato "${platoEliminado.nombre}" eliminado`);

    return true;
  }

  // ============================================
  // 👆 GESTIÓN DE ASIGNACIONES Y FAVORITOS
  // ============================================

  /**
   * Toggle (alternar) favorito en una celda específica
   *
   * @param plato - Objeto del plato
   * @param dia - Día de la semana
   * @param momento - Comida o cena
   */
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

  /**
   * Toggle (alternar) asignación de un plato a un día/momento
   * Si existe → la elimina
   * Si no existe → la crea
   *
   * @param plato - Objeto del plato
   * @param dia - Día de la semana
   * @param momento - Comida o cena
   */
  function toggleAsignacion(plato: ComidaAsignada, dia: DiasSemana, momento: MomentoComida): void {
    const indiceAsignacion = plato.asignaciones.findIndex(
      (a) => a.dia === dia && a.momento === momento,
    );

    if (indiceAsignacion !== -1) {
      // Existe → eliminar
      plato.asignaciones.splice(indiceAsignacion, 1);
      console.log(`❌ Store: Asignación eliminada - ${plato.nombre} (${dia}/${momento})`);
    } else {
      // No existe → crear
      plato.asignaciones.push({
        dia,
        momento,
        favorito: false,
        fechaAsignacion: new Date().toISOString(),
      });
      console.log(`✅ Store: Asignación creada - ${plato.nombre} (${dia}/${momento})`);
    }

    incrementarCambios();
  }

  /**
   * Buscar una asignación específica de un plato
   *
   * @param plato - Objeto del plato
   * @param dia - Día de la semana
   * @param momento - Comida o cena
   * @returns La asignación encontrada o undefined
   */
  function buscarAsignacion(
    plato: ComidaAsignada,
    dia: DiasSemana,
    momento: MomentoComida,
  ): Asignacion | undefined {
    return buscarAsignacionInterna(plato, dia, momento);
  }

  // ============================================
  // 👆 PERSISTENCIA (localStorage)
  // ============================================

  /**
   * Resetear el contador de cambios pendientes a 0
   * Se llama tras guardar exitosamente
   */
  function resetCambiosPendientes(): void {
    const anterior = cambiosPendientes.value;
    cambiosPendientes.value = 0;
    esAutoGuardado.value = false;

    console.log(`🔄 Store: Cambios reseteados (${anterior} → 0)`);
  }

  /**
   * Guardar todos los datos actuales en localStorage
   * Incluye UI states (loading, success, error)
   */
  async function guardarCambios(): Promise<void> {
    // Evitar guardados duplicados simultáneos
    if (isGuardando.value) {
      console.log('⏳ Store: Ya hay un guardado en progreso');
      return;
    }

    try {
      // Estados UI: cargando
      isGuardando.value = true;
      showErrorGuardado.value = false;
      showExitoGuardado.value = false;

      // Simular delay de red (quitar en producción si no necesitas)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Serializar y guardar
      const datosJSON = JSON.stringify(platos.value);
      localStorage.setItem('menu-semanal-favoritos', datosJSON);

      // Éxito
      showExitoGuardado.value = true;
      resetCambiosPendientes();

      console.log(`💾 Store: Guardados ${platos.value.length} platos en localStorage`);
      mostrarToastExito('¡Datos guardados correctamente!');

      // Ocultar estado de éxito después de 2 segundos
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

  /**
   * Cargar datos desde localStorage
   * Retorna true si tuvo éxito, false si hubo error o no había datos
   *
   * @returns true si se cargaron datos
   */
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

  /**
   * Limpiar todos los datos (localStorage + memoria)
   * Opción peligrosa, usar con cuidado
   */
  function limpiarTodo(): void {
    platos.value = [];
    cambiosPendientes.value = 0;
    localStorage.removeItem('menu-semanal-favoritos');

    console.log('🧹 Store: Todos los datos eliminados');
    mostrarToastInfo('Datos eliminados');
  }

  // ============================================
  // 👆 CONTROL DE CAMBIOS PENDIENTES (Badge)
  // ============================================

  /**
   * Incrementar el contador de cambios pendientes
   * Se llama automáticamente tras cada modificación
   */
  function incrementarCambios(): void {
    cambiosPendientes.value++;
    console.log(`📊 Store: Cambios pendientes = ${cambiosPendientes.value}`);
  }

  /**
   * Marcar que ocurrió un guardado automático
   * (ej: cuando usePlatoForm guarda tras crear plato)
   * Esto evita que aparezca el badge innecesariamente
   */
  function marcarComoAutoGuardado(): void {
    esAutoGuardado.value = true;
    cambiosPendientes.value = 0; // Resetear inmediatamente

    // Mostrar éxito brevemente
    showExitoGuardado.value = true;

    // Resetear flags después de 2 segundos
    setTimeout(() => {
      esAutoGuardado.value = false;
      showExitoGuardado.value = false;
    }, 2000);

    console.log('🤖 Store: Marcado como auto-guardado (badge oculto)');
  }

  // ============================================
  // 👆 SISTEMA DE TOASTS (Notificaciones)
  // ============================================

  /**
   * Mostrar toast genérico
   *
   * @param mensaje - Texto a mostrar
   * @param tipo - Tipo de toast ('exito', 'error', 'info')
   * @param duracion - Tiempo en ms antes de ocultar (default: 3000ms)
   */
  function mostrarToast(
    mensaje: string,
    tipo: 'exito' | 'error' | 'info' = 'info',
    duracion: number = 3000,
  ): void {
    // Limpiar timer anterior si existe
    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    // Setear nuevos valores
    mensajeToast.value = mensaje;
    tipoToast.value = tipo;

    // Auto-ocultar después de la duración
    if (duracion > 0) {
      toastTimer = setTimeout(() => {
        mensajeToast.value = '';
        toastTimer = null;
      }, duracion);
    }
  }

  /**
   * Atajo: Toast de éxito
   */
  function mostrarToastExito(mensaje: string): void {
    mostrarToast(mensaje, 'exito');
  }

  /**
   * Atajo: Toast de error
   */
  function mostrarToastError(mensaje: string): void {
    mostrarToast(mensaje, 'error', 4000); // Errores duran más
  }

  /**
   * Atajo: Toast informativo
   */
  function mostrarToastInfo(mensaje: string): void {
    mostrarToast(mensaje, 'info');
  }

  /**
   * Ocultar toast manualmente
   */
  function ocultarToast(): void {
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }
    mensajeToast.value = '';
  }

  // ============================================
  // 🔧 FUNCIONES AUXILIARES (Privadas)
  // ============================================

  /**
   * Generar un ID único para nuevos platos
   * Usa crypto.randomUUID() si está disponible, sino Date.now()
   */
  function generarIdUnico(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback para navegadores antiguos
    return `plato-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Buscar asignación interna (sin exponer al exterior directamente)
   */
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

  // ============================================
  // 📤 RETORNO: API PÚBLICA DEL STORE
  // ============================================

  return {
    // State (reactivo)
    platos,
    cambiosPendientes,
    isGuardando,
    showExitoGuardado,
    showErrorGuardado,
    mensajeToast,
    tipoToast,
    esAutoGuardado,

    // Getters (computados)
    platosOrdenados,
    hayCambios,
    totalPlatos,

    // Actions: Gestión de platos
    cargarPlatos,
    incluirNuevoPlato,
    eliminarPlato,

    // Actions: Asignaciones y favoritos
    toggleFavorito,
    toggleAsignacion,
    buscarAsignacion,

    // Actions: Persistencia
    guardarCambios,
    cargarDesdeLocalStorage,
    limpiarTodo,

    // Actions: Control de cambios
    incrementarCambios,
    resetCambiosPendientes,
    marcarComoAutoGuardado,

    // Actions: Sistema de toasts
    mostrarToast,
    mostrarToastExito,
    mostrarToastError,
    mostrarToastInfo,
    ocultarToast,

    obtenerPlatos,
    obtenerTodosPlatosDelDia,
  };
});
