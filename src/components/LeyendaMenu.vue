<template>
  <details class="leyenda-colapsable">
    <summary class="leyenda-summary">❓ ¿Qué significan los símbolos?</summary>

    <div class="leyenda-contenido">
      <div class="leyenda-fila"><strong>⭐</strong> Plato marcado como favorito</div>
      <div class="leyenda-fila"><strong>●</strong> Plato asignado al menú</div>
      <div class="leyenda-fila"><strong>☀</strong> Tamaño móvil: Comida (mediodía).</div>
      <div class="leyenda-fila"><strong>🌙</strong> Tamaño móvil: Cena (noche).</div>
      <div class="leyenda-fila leyenda-tip">
        <ul>
          <span>💡 Click</span>
          <li><em>Izquierdo en cualquier celda para alternar favorito.</em></li>
          <li>
            <em>Derecho en cualquier celda para añadir/eliminar plato.</em>
          </li>
        </ul>
      </div>
    </div>
  </details>
</template>

<style scoped>
.leyenda-colapsable {
  max-width: 500px;
  margin: 10px auto 0 auto;

  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
}

.leyenda-summary {
  padding: 12px 16px;
  background-color: #f1f3f5;
  cursor: pointer;
  font-weight: 600;
  color: #495057;

  /* Ocultar flecha por defecto */
  list-style: none;
}

.leyenda-summary::-webkit-details-marker {
  display: none;
}

.leyenda-summary::before {
  content: '▶ ';
  display: inline-block;
  margin-right: 8px;
  transition: transform 0.2s ease;
}

details[open] .leyenda-summary::before {
  transform: rotate(90deg);
}

.leyenda-contenido {
  padding: 12px 16px;
  background-color: white;
  border-top: 1px solid #dee2e6;
}

.leyenda-fila {
  padding: 6px 0;
  font-size: 14px;
  color: #495057;
  border-bottom: 1px dotted #dee2e6;
}

.leyenda-fila:last-child {
  border-bottom: none;
}

.leyenda-fila strong {
  display: inline-block;
  width: 40px;
  font-size: 18px;
}

.leyenda-tip {
  margin-top: 8px;
  padding: 8px;
  background-color: #d4edda;
  border-radius: 4px;
  font-size: 13px;
  color: #155724;
}
</style>
