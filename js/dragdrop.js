/**
 * Sistema de Drag & Drop para horarios con validaciones
 */

let draggedElement = null;
let draggedData = null;

/**
 * Inicializa el sistema de drag and drop
 */
export function initDragAndDrop(schedule, teachers) {
  // Delegar eventos a las celdas
  document.addEventListener('dragstart', handleDragStart);
  document.addEventListener('dragover', handleDragOver);
  document.addEventListener('drop', handleDrop);
  document.addEventListener('dragend', handleDragEnd);
  
  // Hacer celdas draggable
  updateDraggableCells();
}

/**
 * Actualiza qué celdas son draggables
 */
function updateDraggableCells() {
  const cells = document.querySelectorAll('.draggable-class');
  cells.forEach(cell => {
    cell.draggable = true;
  });
}

/**
 * Handle cuando inicia el drag
 */
function handleDragStart(e) {
  if (!e.target.classList.contains('draggable-class')) return;
  
  draggedElement = e.target;
  draggedData = {
    subject: e.target.dataset.subject,
    teacher: e.target.dataset.teacher,
    group: e.target.dataset.group,
    fromDay: e.target.dataset.day,
    fromHour: e.target.dataset.hour,
    fromType: e.target.dataset.type // 'general' o 'group'
  };
  
  e.dataTransfer.effectAllowed = 'move';
  e.target.style.opacity = '0.5';
}

/**
 * Handle cuando se arrastra sobre una celda
 */
function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  
  // Highlight de celdas válidas
  if (e.target.classList.contains('droppable-slot')) {
    e.target.style.backgroundColor = '#e8f5e9';
    e.target.style.borderColor = '#4caf50';
    e.target.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.3)';
  }
}

/**
 * Handle cuando se suelta en una celda
 */
function handleDrop(e) {
  e.preventDefault();
  
  if (!draggedData) return;
  
  const targetCell = e.target.closest('.droppable-slot');
  if (!targetCell) return;
  
  const toDay = targetCell.dataset.day;
  const toHour = targetCell.dataset.hour;
  
  // Validar movimiento
  const validation = validateMove(draggedData, toDay, toHour);
  
  if (!validation.valid) {
    showAlert('error', validation.message);
    return;
  }
  
  // Si es válido, ejecutar el movimiento
  performMove(draggedData, toDay, toHour);
  showAlert('success', `Clase movida exitosamente a ${toDay} ${toHour}`);
  
  // Limpiar estilos
  document.querySelectorAll('.droppable-slot').forEach(cell => {
    cell.style.backgroundColor = '';
    cell.style.borderColor = '';
    cell.style.boxShadow = '';
  });
}

/**
 * Handle cuando termina el drag
 */
function handleDragEnd(e) {
  draggedElement.style.opacity = '1';
  
  // Limpiar highlight
  document.querySelectorAll('.droppable-slot').forEach(cell => {
    cell.style.backgroundColor = '';
    cell.style.borderColor = '';
    cell.style.boxShadow = '';
  });
}

/**
 * Valida si el movimiento es permitido
 */
function validateMove(data, toDay, toHour) {
  // Obtener docente
  const teachers = window.allTeachers || [];
  const teacher = teachers.find(t => t.name === data.teacher);
  
  if (!teacher) {
    return {
      valid: false,
      message: `Error: No se encontró información del docente ${data.teacher}`
    };
  }
  
  // Validación 1: Verificar disponibilidad del docente
  const availability = teacher.availability[toDay];
  if (!availability || !availability.includes(toHour)) {
    return {
      valid: false,
      message: `❌ ${data.teacher} no tiene disponibilidad el ${toDay} a las ${toHour}`
    };
  }
  
  // Validación 2: Verificar que no haya conflicto con otro docente
  const schedule = window.currentSchedule || [];
  const conflictTeacher = schedule.find(s => 
    s.teacher === data.teacher && 
    s.day === toDay && 
    s.hour === toHour &&
    !(s.day === data.fromDay && s.hour === data.fromHour) // No contar la misma clase
  );
  
  if (conflictTeacher) {
    return {
      valid: false,
      message: `❌ ${data.teacher} ya tiene clase a las ${toHour} del ${toDay}`
    };
  }
  
  // Validación 3: Verificar que el grupo no tenga otro horario
  const conflictGroup = schedule.find(s => 
    s.group === data.group && 
    s.day === toDay && 
    s.hour === toHour &&
    !(s.day === data.fromDay && s.hour === data.fromHour)
  );
  
  if (conflictGroup) {
    return {
      valid: false,
      message: `❌ El ${data.group} ya tiene clase a las ${toHour} del ${toDay}`
    };
  }
  
  return { valid: true };
}

/**
 * Ejecuta el movimiento
 */
function performMove(data, toDay, toHour) {
  const schedule = window.currentSchedule || [];
  
  // Encontrar la clase y actualizar
  const classIndex = schedule.findIndex(s =>
    s.subject === data.subject &&
    s.teacher === data.teacher &&
    s.group === data.group &&
    s.day === data.fromDay &&
    s.hour === data.fromHour
  );
  
  if (classIndex !== -1) {
    schedule[classIndex].day = toDay;
    schedule[classIndex].hour = toHour;
    
    // Redibujar horarios
    window.refreshScheduleDisplay && window.refreshScheduleDisplay();
  }
}

/**
 * Muestra una alerta estilizada
 */
function showAlert(type, message) {
  const alert = document.createElement('div');
  alert.className = `drag-alert drag-alert-${type}`;
  alert.innerHTML = message;
  
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => alert.remove(), 300);
  }, 3000);
}

export { updateDraggableCells };
