// src/stores/menuStore.ts (NUEVO - Especializado para la tabla)
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { ComidaAsignada, MomentoComida } from '@/types';
import { DiasSemana } from '@/types';

export const useMenuStore = defineStore('menu', () => {
  // ============================================
  // 📦 ESTADO REACTIVO (State)
  // ============================================

  const platos = ref<ComidaAsignada[]>([]);
  const cambiosPendientes = ref(0);
  const isGuardando = ref(false);
  const showExitoGuardado = ref(false);
  const showErrorGuardado = ref(false);
  const ultimoGuardado = ref('');

  // Toast notifications
  const mensajeToast = ref('');
  const tipoToast = ref<'exito' | 'error' | 'info'>('info');

  // ============================================
  // 🔢 GETTERS (Computados)
  // ============================================

  const hayCambios = computed(() => cambiosPendientes.value > 0);

  const platosOrdenados = computed(() => {
    return [...platos.value].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }),
    );
  });

  // ============================================
  // ⚡ ACTIONS (Métodos que modifican estado)
  // ============================================

  /** Cargar datos iniciales (desde JSON o localStorage) */
  function cargarPlatos(datos: ComidaAsignada[]) {
    platos.value = datos;
    console.log('📥 Platos cargados:', datos.length);
  }

  /** Incrementar contador de cambios pendientes */
  function incrementarContadorCambios(): void {
    cambiosPendientes.value++;
    console.log(`📝 Cambios pendientes: ${cambiosPendientes.value}`);
  }

  /** Resetear contador después de guardar */
  function resetearContadorCambios(): void {
    cambiosPendientes.value = 0;
  }

  /** Buscar asignación específica */
  function buscarAsignacion(plato: ComidaAsignada, dia: DiasSemana, momento: MomentoComida) {
    return plato.asignaciones.find((a) => a.dia === dia && a.momento === momento);
  }

  /** Toggle favorito en celda */
  function toggleFavorito(plato: ComidaAsignada, dia: DiasSemana, momento: MomentoComida): void {
    const asignacion = buscarAsignacion(plato, dia, momento);

    if (asignacion) {
      asignacion.favorito = !asignacion.favorito;

      // 👈 CONTAR CAMBIO AUTOMÁTICAMENTE
      incrementarContadorCambios();

      const estado = asignacion.favorito ? '⭐ FAVORITO' : '● Normal';
      console.log(`🔄 [FAVORITO] ${plato.nombre} | ${dia} ${momento} → ${estado}`);
    } else {
      console.log(`ℹ️ [INFO] "${plato.nombre}" no está asignado a ${dia} ${momento}`);
    }
  }

  /** Añadir o eliminar asignación de plato a día/momento */
  function toggleAsignacion(plato: ComidaAsignada, dia: DiasSemana, momento: MomentoComida): void {
    const indiceExistente = plato.asignaciones.findIndex(
      (a) => a.dia === dia && a.momento === momento,
    );

    if (indiceExistente === -1) {
      // ➕ AÑADIR nueva asignación
      plato.asignaciones.push({
        dia,
        momento,
        favorito: false,
      });
      console.log(`✅ [AÑADIR] "${plato.nombre}" → ${dia} ${momento}`);
    } else {
      // 🗑️ ELIMINAR asignación existente
      plato.asignaciones.splice(indiceExistente, 1);
      console.log(`🗑️ [BORRAR] "${plato.nombre}" ← ${dia} ${momento}`);
    }

    // 👈 CONTAR CAMBIO AUTOMÁTICAMENTE
    incrementarContadorCambios();
  }

  /** Guardar cambios en localStorage + manejar UI states */
  async function guardarCambios(): Promise<void> {
    try {
      // 1. Iniciar estados UI
      isGuardando.value = true;
      showExitoGuardado.value = false;
      showErrorGuardado.value = false;

      console.log('💾 Iniciando guardado...');

      // 2. Simular delay visual (opcional)
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 3. Guardar en localStorage
      localStorage.setItem('menu-semanal-favoritos', JSON.stringify(platos.value));

      console.log('✅ Guardado exitoso');
      console.log(`   Tamaño: ${(JSON.stringify(platos.value).length / 1024).toFixed(2)} KB`);

      // 4. Actualizar estados de éxito
      showExitoGuardado.value = true;
      resetearContadorCambios();
      mostrarToast('¡Cambios guardados correctamente!', 'exito');

      // 5. Ocultar éxito después de 2 segundos
      setTimeout(() => {
        showExitoGuardado.value = false;
      }, 2000);
    } catch (error) {
      console.error('❌ Error al guardar:', error);

      showErrorGuardado.value = true;
      mostrarToast('Error al guardar los cambios', 'error');

      setTimeout(() => {
        showErrorGuardado.value = false;
      }, 3000);
    } finally {
      // Siempre finalizar estado de carga
      isGuardando.value = false;
    }
  }

  /** Mostrar notificación toast temporal */
  function mostrarToast(mensaje: string, tipo: 'exito' | 'error' | 'info'): void {
    mensajeToast.value = mensaje;
    tipoToast.value = tipo;

    setTimeout(() => {
      mensajeToast.value = '';
    }, 3000);
  }

  function obtenerPlatos(diaActual: DiasSemana, momentoActual: MomentoComida): string[] {
    const platosEncontrados = platos.value.filter((plato) =>
      plato.asignaciones.some(
        (asignacion) => asignacion.dia === diaActual && asignacion.momento === momentoActual,
      ),
    );

    return platosEncontrados.map((platoEncontrado) => {
      const asignacionEspecifica = platoEncontrado.asignaciones.find(
        (asignacion) => asignacion.dia === diaActual && asignacion.momento === momentoActual,
      );

      if (asignacionEspecifica?.favorito) {
        return `${platoEncontrado.nombre} ⭐`;
      }

      return platoEncontrado.nombre;
    });
  }

  // Añadir nuevo plato
  function incluirNuevoPlato(
    nombre: string,
    dia: DiasSemana,
    momento: MomentoComida,
  ): ComidaAsignada {
    // Validación básica
    if (!nombre || nombre.trim() === '') {
      console.error('❌ Error: El nombre del plato no puede estar vacío');
      throw new Error('El nombre del plato es obligatorio');
    }

    // Crear nuevo objeto plato
    const nuevoPlato: ComidaAsignada = {
      id: crypto.randomUUID(), // ✅ ID único universal
      nombre: nombre.trim(), // ✅ Limpiar espacios
      asignaciones: [
        {
          dia: dia,
          momento: momento,
          favorito: false, // Por defecto no es favorito
        },
      ],
    };

    // Añadir al array reactivo
    platos.value.push(nuevoPlato);

    // Contar cambio pendiente
    incrementarContadorCambios();

    console.log(`✅ [NUEVO PLATO] "${nombre}" añadido → ${dia} (${momento})`);
    console.log('   📋 ID:', nuevoPlato.id);

    return nuevoPlato;
  }

  // ============================================
  // 📤 RETORNO: API pública del store
  // ============================================

  return {
    // Estado
    platos,
    cambiosPendientes,
    isGuardando,
    showExitoGuardado,
    showErrorGuardado,
    ultimoGuardado,
    mensajeToast,
    tipoToast,

    // Getters
    hayCambios,
    platosOrdenados,

    // Actions
    cargarPlatos,
    incrementarContadorCambios,
    resetearContadorCambios,
    buscarAsignacion,
    toggleFavorito,
    toggleAsignacion,
    guardarCambios,
    mostrarToast,
    obtenerPlatos,
    incluirNuevoPlato,
  };
});
