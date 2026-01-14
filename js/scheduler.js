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
   * Intenta asignar un horario a una materia de un grupo
   */
  assignSchedule(group, subject) {
    // Buscar un docente disponible y calificado
    for (const teacher of teachers) {
      // Verificar si el docente puede enseñar esta materia
      if (!this.canTeachSubject(teacher, subject)) continue;

      // Buscar un slot disponible para el docente y el grupo
      for (const day of days) {
        for (const hour of hours) {
          // Validar todas las restricciones
          if (
            this.isTeacherAvailable(teacher, day, hour) &&
            this.isTeacherSlotFree(teacher, day, hour) &&
            this.isGroupSlotFree(group, day, hour)
          ) {
            // Asignación exitosa
            const assignment = {
              group: group.name,
              subject,
              teacher: teacher.name,
              day,
              hour,
              error: null
            };

            // Registrar los slots como usados
            this.usedSlots.teacher[`${teacher.id}-${day}-${hour}`] = true;
            this.usedSlots.group[`${group.id}-${day}-${hour}`] = true;

            this.schedule.push(assignment);
            return true;
          }
        }
      }
    }

    // No se pudo asignar
    const error = this.getErrorReason(group, subject);
    this.schedule.push({
      group: group.name,
      subject,
      teacher: "N/A",
      day: "N/A",
      hour: "N/A",
      error
    });
    this.errors.push(error);
    return false;
  }

  /**
   * Determina la razón del error de asignación
   */
  getErrorReason(group, subject) {
    const capableTeachers = teachers.filter(t => t.subjects.includes(subject));

    if (capableTeachers.length === 0) {
      return "No hay docente calificado para enseñar esta materia";
    }

    // Verificar disponibilidad de docentes
    const availableTeachers = capableTeachers.filter(teacher => {
      for (const day of days) {
        for (const hour of hours) {
          if (
            this.isTeacherAvailable(teacher, day, hour) &&
            this.isTeacherSlotFree(teacher, day, hour) &&
            this.isGroupSlotFree(group, day, hour)
          ) {
            return true;
          }
        }
      }
      return false;
    });

    if (availableTeachers.length === 0) {
      return "No hay disponibilidad de horario para esta materia";
    }

    return "No fue posible asignar horario";
  }

  /**
   * Genera el horario completo
   */
  generate() {
    this.schedule = [];
    this.usedSlots = { teacher: {}, group: {} };
    this.errors = [];

    // Asignar cada materia de cada grupo
    for (const group of groups) {
      for (const subject of group.subjects) {
        this.assignSchedule(group, subject);
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
 */
export function generateSchedule() {
  const generator = new ScheduleGenerator();
  const schedule = generator.generate();
  
  // Guardar el resumen en window para uso en app.js
  window.scheduleSummary = generator.getSummary();
  
  return schedule;
}