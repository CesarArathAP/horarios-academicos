import { teachers, groups, days, hours } from "./data.js";

/**
 * Clase para gestionar la asignación de horarios
 * Valida todas las reglas de conflictos
 */
class ScheduleGenerator {
  constructor() {
    this.schedule = [];
    this.usedSlots = {
      teacher: {}, // docente-día-hora
      group: {}    // grupo-día-hora
    };
    this.errors = [];
  }

  /**
   * Valida que un docente pueda enseñar una materia
   * Regla: Un docente solo puede impartir materias que domina
   */
  canTeachSubject(teacher, subject) {
    return teacher.subjects.includes(subject);
  }

  /**
   * Valida la disponibilidad del docente en día y hora
   * Regla: Las clases solo dentro de la disponibilidad del docente
   */
  isTeacherAvailable(teacher, day, hour) {
    const availability = teacher.availability[day] || [];
    return availability.includes(hour);
  }

  /**
   * Valida que el docente no tenga otra clase a esa hora
   * Regla: Un docente no puede tener dos clases al mismo tiempo
   */
  isTeacherSlotFree(teacher, day, hour) {
    const key = `${teacher.id}-${day}-${hour}`;
    return !this.usedSlots.teacher[key];
  }

  /**
   * Valida que el grupo no tenga otra materia a esa hora
   * Regla: Un grupo no puede tener dos materias en la misma franja
   */
  isGroupSlotFree(group, day, hour) {
    const key = `${group.id}-${day}-${hour}`;
    return !this.usedSlots.group[key];
  }

  /**
   * Obtiene todos los slots disponibles para un docente-materia-grupo
   * Ordenados para mejor distribución a lo largo de la semana
   */
  getAvailableSlots(teacher, group) {
    const slots = [];
    
    for (const day of days) {
      for (const hour of hours) {
        if (
          this.isTeacherAvailable(teacher, day, hour) &&
          this.isTeacherSlotFree(teacher, day, hour) &&
          this.isGroupSlotFree(group, day, hour)
        ) {
          slots.push({ day, hour });
        }
      }
    }
    
    return slots;
  }

  /**
   * Cuenta cuántas clases tiene un grupo en un día específico
   */
  countGroupClassesInDay(group, day) {
    return this.schedule.filter(
      s => s.group === group.name && s.day === day && !s.error
    ).length;
  }

  /**
   * Obtiene la siguiente hora en la lista
   */
  getNextHour(currentHour) {
    const currentIndex = hours.indexOf(currentHour);
    if (currentIndex === -1 || currentIndex === hours.length - 1) return null;
    return hours[currentIndex + 1];
  }

  /**
   * Verifica si una clase puede durar 2 horas (siguientes slots disponibles)
   */
  canBe2Hours(teacher, group, day, startHour) {
    const nextHour = this.getNextHour(startHour);
    if (!nextHour) return false;

    return (
      this.isTeacherAvailable(teacher, day, nextHour) &&
      this.isTeacherSlotFree(teacher, day, nextHour) &&
      this.isGroupSlotFree(group, day, nextHour)
    );
  }

  /**
   * Marca los slots como usados para una clase
   */
  markSlotsAsUsed(teacher, group, day, startHour, duration = 1) {
    this.usedSlots.teacher[`${teacher.id}-${day}-${startHour}`] = true;
    this.usedSlots.group[`${group.id}-${day}-${startHour}`] = true;

    if (duration === 2) {
      const nextHour = this.getNextHour(startHour);
      if (nextHour) {
        this.usedSlots.teacher[`${teacher.id}-${day}-${nextHour}`] = true;
        this.usedSlots.group[`${group.id}-${day}-${nextHour}`] = true;
      }
    }
  }

  /**
   * Selecciona el mejor slot disponible priorizando distribución en la semana
   * Introduce variabilidad en la selección de slots
   */
  selectBestSlot(slots, group, useVariability = true) {
    if (slots.length === 0) return null;
    if (slots.length === 1) return slots[0];

    // Contar clases por día para este grupo
    const classesPerDay = {};
    days.forEach(day => {
      classesPerDay[day] = this.countGroupClassesInDay(group, day);
    });

    // Agrupar slots por día
    const slotsByDay = {};
    slots.forEach(slot => {
      if (!slotsByDay[slot.day]) {
        slotsByDay[slot.day] = [];
      }
      slotsByDay[slot.day].push(slot);
    });

    // Con variabilidad: considerar múltiples días viables
    if (useVariability) {
      // Encontrar los días con menos clases (pueden ser varios con igual cantidad)
      let minClasses = Infinity;
      const preferredDays = [];

      for (const day of days) {
        if (slotsByDay[day]) {
          const dayClassCount = classesPerDay[day];
          if (dayClassCount < minClasses) {
            minClasses = dayClassCount;
            preferredDays.length = 0;
            preferredDays.push(day);
          } else if (dayClassCount === minClasses) {
            preferredDays.push(day);
          }
        }
      }

      // Seleccionar un día aleatorio de los preferidos (para variabilidad)
      if (preferredDays.length > 0) {
        const randomDay = preferredDays[Math.floor(Math.random() * preferredDays.length)];
        if (slotsByDay[randomDay]) {
          const daySlots = slotsByDay[randomDay];
          return daySlots[Math.floor(Math.random() * daySlots.length)];
        }
      }
    } else {
      // Sin variabilidad: usar el primer día con menos clases
      let minClasses = Infinity;
      let preferredDay = null;

      for (const day of days) {
        if (slotsByDay[day] && classesPerDay[day] < minClasses) {
          minClasses = classesPerDay[day];
          preferredDay = day;
        }
      }

      if (preferredDay && slotsByDay[preferredDay]) {
        const daySlots = slotsByDay[preferredDay];
        return daySlots[0];
      }
    }

    // Si no, seleccionar un slot aleatorio de todos
    return slots[Math.floor(Math.random() * slots.length)];
  }

  /**
   * Intenta asignar un horario a una materia de un grupo
   * Usa estrategia inteligente de distribución por días de la semana y docentes variados
   */
  assignSchedule(group, subject, useVariability = true) {
    // Filtrar docentes que pueden enseñar esta materia
    const capableTeachers = teachers.filter(t => this.canTeachSubject(t, subject));

    if (capableTeachers.length === 0) {
      this.schedule.push({
        group: group.name,
        subject,
        teacher: "N/A",
        day: "N/A",
        hour: "N/A",
        endHour: "N/A",
        duration: 1,
        error: "No hay docente calificado para enseñar esta materia"
      });
      this.errors.push("No hay docente calificado para enseñar esta materia");
      return false;
    }

    // Obtener docentes con sus slots disponibles
    const teachersWithSlots = capableTeachers
      .map(teacher => ({
        teacher,
        slots: this.getAvailableSlots(teacher, group)
      }))
      .filter(t => t.slots.length > 0);

    if (teachersWithSlots.length === 0) {
      this.schedule.push({
        group: group.name,
        subject,
        teacher: "N/A",
        day: "N/A",
        hour: "N/A",
        endHour: "N/A",
        duration: 1,
        error: "No hay disponibilidad de horario para esta materia"
      });
      this.errors.push("No hay disponibilidad de horario para esta materia");
      return false;
    }

    // Seleccionar docente con variabilidad
    let selectedTeacher;
    if (useVariability && teachersWithSlots.length > 1) {
      // Seleccionar un docente aleatorio de los disponibles (introduce variabilidad)
      selectedTeacher = teachersWithSlots[Math.floor(Math.random() * teachersWithSlots.length)];
    } else {
      // Sin variabilidad: seleccionar docente con menos disponibilidad (para priorizar)
      teachersWithSlots.sort((a, b) => a.slots.length - b.slots.length);
      selectedTeacher = teachersWithSlots[0];
    }

    const { teacher, slots } = selectedTeacher;
    const slot = this.selectBestSlot(slots, group, useVariability);

    if (!slot) {
      this.schedule.push({
        group: group.name,
        subject,
        teacher: "N/A",
        day: "N/A",
        hour: "N/A",
        endHour: "N/A",
        duration: 1,
        error: "No fue posible asignar horario"
      });
      this.errors.push("No fue posible asignar horario");
      return false;
    }

    const { day, hour } = slot;
    // Asignación exitosa
    // Determinar duración: 2 horas si es posible, sino 1 hora
    const duration = this.canBe2Hours(teacher, group, day, hour) ? 2 : 1;

    const nextHour = duration === 2 ? this.getNextHour(hour) : null;

    const assignment = {
      group: group.name,
      subject,
      teacher: teacher.name,
      day,
      hour,
      endHour: nextHour,
      duration,
      error: null
    };

    // Registrar los slots como usados
    this.markSlotsAsUsed(teacher, group, day, hour, duration);

    this.schedule.push(assignment);
    return true;
  }

  /**
   * Genera el horario completo
   * @param {boolean} useVariability - Si true, introduce variabilidad en las asignaciones
   */
  generate(useVariability = true) {
    this.schedule = [];
    this.usedSlots = { teacher: {}, group: {} };
    this.errors = [];

    // Asignar cada materia de cada grupo
    for (const group of groups) {
      for (const subject of group.subjects) {
        this.assignSchedule(group, subject, useVariability);
      }
    }

    return this.schedule;
  }

  /**
   * Obtiene un resumen de errores
   */
  getSummary() {
    const total = this.schedule.length;
    const assigned = this.schedule.filter(s => !s.error).length;
    const conflicts = this.schedule.filter(s => s.error).length;

    return {
      total,
      assigned,
      conflicts,
      errors: this.errors
    };
  }
}

/**
 * Función principal para generar el horario
 * @param {boolean} useVariability - Si true, introduce variabilidad en las asignaciones
 */
export function generateSchedule(useVariability = true) {
  const generator = new ScheduleGenerator();
  const schedule = generator.generate(useVariability);
  
  // Guardar el resumen en window para uso en app.js
  window.scheduleSummary = generator.getSummary();
  
  return schedule;
}