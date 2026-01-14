/**
 * Configuración de días y horas disponibles
 */
export const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
export const hours = ["08:00", "10:00", "12:00", "14:00", "16:00"];

/**
 * Modelo de Docentes
 * - id: identificador único
 * - name: nombre del docente
 * - subjects: materias que domina (puede enseñar)
 * - availability: disponibilidad por día y hora
 */
export const teachers = [
  {
    id: 1,
    name: "Ana López",
    subjects: ["Matemáticas", "Física"],
    availability: {
      Lunes: ["08:00", "10:00", "14:00"],
      Martes: ["10:00", "12:00"],
      Miércoles: ["08:00", "16:00"],
      Jueves: ["12:00", "14:00"],
      Viernes: ["08:00", "10:00", "12:00", "16:00"]
    }
  },
  {
    id: 2,
    name: "Carlos Pérez",
    subjects: ["Historia", "Geografía"],
    availability: {
      Lunes: ["12:00", "14:00"],
      Martes: ["08:00", "10:00"],
      Miércoles: ["12:00", "14:00"],
      Jueves: ["08:00", "10:00", "16:00"],
      Viernes: ["10:00", "12:00", "14:00", "16:00"]
    }
  },
  {
    id: 3,
    name: "María García",
    subjects: ["Física", "Química"],
    availability: {
      Lunes: ["16:00"],
      Martes: ["14:00", "16:00"],
      Miércoles: ["10:00", "12:00"],
      Jueves: ["14:00"],
      Viernes: ["08:00", "14:00", "16:00"]
    }
  },
  {
    id: 4,
    name: "Juan Rodríguez",
    subjects: ["Química", "Biología"],
    availability: {
      Lunes: ["10:00"],
      Martes: ["12:00", "16:00"],
      Miércoles: ["14:00"],
      Jueves: ["10:00", "16:00"],
      Viernes: ["10:00", "12:00", "14:00"]
    }
  }
];

/**
 * Modelo de Materias
 * - id: identificador único
 * - name: nombre de la materia
 */
export const subjects = [
  { id: 1, name: "Matemáticas" },
  { id: 2, name: "Física" },
  { id: 3, name: "Química" },
  { id: 4, name: "Biología" },
  { id: 5, name: "Historia" },
  { id: 6, name: "Geografía" }
];

/**
 * Modelo de Grupos
 * - id: identificador único
 * - name: nombre del grupo
 * - subjects: materias que necesita cursar (a asignar)
 */
export const groups = [
  {
    id: 1,
    name: "Grupo A",
    subjects: ["Matemáticas", "Física", "Química", "Historia", "Biología", "Geografía"]
  },
  {
    id: 2,
    name: "Grupo B",
    subjects: ["Matemáticas", "Física", "Química", "Historia", "Biología", "Geografía"]
  },
  {
    id: 3,
    name: "Grupo C",
    subjects: ["Matemáticas", "Física", "Química", "Historia", "Biología", "Geografía"]
  }
];