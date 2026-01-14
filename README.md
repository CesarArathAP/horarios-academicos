# Asignación de Horarios Académicos

Aplicación web frontend-only que asigna horarios académicos respetando reglas básicas de disponibilidad y sin generar conflictos.

## 🎯 Objetivo

Desarrollar una **aplicación web del lado del cliente** que asigne horarios académicos de manera automática, respetando restricciones de disponibilidad de docentes y evitando conflictos de programación.

---

## 📋 Alcance

### ✅ Incluye
- **Modelado de datos** - Docentes, materias, grupos y horarios
- **Asignación automática** - Algoritmo de asignación basada en disponibilidad
- **Detección de conflictos** - Identificación de problemas en la asignación
- **Visualización clara** - Tabla con información del horario generado
- **Resumen de resultados** - Estadísticas de asignación exitosa y errores

### ❌ No incluye
- Backend o servidor
- Base de datos
- Frameworks o librerías externas
- Optimización avanzada
- Interfaz de administración

---

## 📐 Reglas Obligatorias

La aplicación valida y respeta las siguientes restricciones:

1. **Docentes únicos por franja** - Un docente no puede tener dos clases al mismo tiempo
2. **Grupos sin solapamiento** - Un grupo no puede tener dos materias en la misma franja horaria
3. **Especialización docente** - Un docente solo puede impartir materias que domina
4. **Disponibilidad respetada** - Las clases solo se asignan dentro de la disponibilidad del docente

Si no es posible asignar una clase, la aplicación lo indica claramente con un mensaje de error específico.

---

## 🗂️ Modelo de Datos

### Docentes (`teachers`)
```javascript
{
  id: number,
  name: string,
  subjects: string[],              // Materias que puede enseñar
  availability: {                  // Disponibilidad por día
    [day: string]: string[]        // Array de horas disponibles
  }
}
```

### Materias (`subjects`)
```javascript
{
  id: number,
  name: string
}
```

### Grupos (`groups`)
```javascript
{
  id: number,
  name: string,
  subjects: string[]              // Materias a asignar
}
```

### Horario Asignado
```javascript
{
  group: string,
  subject: string,
  teacher: string,
  day: string,
  hour: string,
  error: string | null            // null si es exitoso
}
```

---

## 🏗️ Estructura del Proyecto

```
horarios-academicos/
├── index.html                 # Página principal
├── README.md                  # Este archivo
├── css/
│   └── styles.css            # Estilos de la aplicación
└── js/
    ├── app.js                # Lógica principal y eventos
    ├── data.js               # Datos: docentes, materias, grupos
    └── scheduler.js          # Motor de asignación de horarios
```

---

## 🚀 Uso

### Instalación
No requiere instalación. Solo clone o descargue el repositorio.

### Ejecución
1. Abra el archivo `index.html` en un navegador web
2. La interfaz mostrará:
   - Título: "Asignación de Horarios Académicos"
   - Botón: "Generar horario"
   - Tabla vacía (se llenará al hacer clic)

3. Haga clic en el botón **"Generar horario"**
4. La tabla mostrará:
   - **Fila de resumen** con estadísticas de la asignación
   - **Filas exitosas** (fondo blanco) con: Día, Hora, Grupo, Materia, Docente
   - **Filas de error** (fondo rojo) con el motivo del conflicto

---

## 💾 Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Estilos responsive con gradientes
- **JavaScript Vanilla (ES6+)** - Módulos y programación orientada a objetos
- **Git** - Control de versiones

**No se utilizan frameworks, librerías externas ni `eval`.**

---

## 🔧 Algoritmo de Asignación

La aplicación utiliza un algoritmo voraz (greedy) que:

1. Itera sobre cada grupo y sus materias
2. Para cada materia, busca un docente cualificado
3. Valida todas las restricciones:
   - ¿El docente puede enseñar esta materia?
   - ¿El docente está disponible ese día y hora?
   - ¿Ya tiene otra clase a esa hora?
   - ¿El grupo ya tiene otra materia a esa hora?
4. Si todas las validaciones pasan, asigna la clase
5. Si no hay disponibilidad, registra el error con motivo específico

---

## 📊 Validaciones Implementadas

### Validación de Docentes
- `canTeachSubject()` - Verifica si el docente domina la materia
- `isTeacherAvailable()` - Verifica la disponibilidad declarada
- `isTeacherSlotFree()` - Verifica que no tenga otra clase a esa hora

### Validación de Grupos
- `isGroupSlotFree()` - Verifica que no tenga otra materia a esa hora

### Manejo de Errores
- Identifica cuando no hay docente capacitado
- Detecta falta de disponibilidad
- Señala conflictos de programación
- Proporciona mensajes descriptivos

---

## 🎨 Interfaz

### Componentes
- **Encabezado** - Título con gradiente
- **Botón de acción** - "Generar horario" con efectos hover
- **Tabla de resultados** - Con colores para distinguir éxitos y errores
- **Fila de resumen** - Estadísticas de la generación

### Estilos
- Gradiente morado/azul profesional
- Diseño responsive
- Transiciones suaves
- Paleta de colores accesible
- Iconos visuales (✓ para éxito, ⚠ para errores)

---

## 📝 Git - Historial de Commits

El repositorio mantiene un historial claro con commits descriptivos:

```bash
feat: implementar modelo de datos completo con docentes, materias y grupos
feat: agregar lógica de asignación de horarios con validaciones
feat: implementar detección de conflictos y manejo de errores
feat: mejorar interfaz con tabla y resumen de resultados
feat: aplicar estilos CSS profesionales y responsive
```

### Convención de Commits
Se utiliza la convención: `<tipo>: <descripción>`

Tipos utilizados:
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de errores
- `refactor:` - Cambios de código sin alterar funcionalidad
- `style:` - Cambios de estilos CSS
- `docs:` - Cambios en documentación

---

## 📌 Requisitos Cumplidos

- ✅ Desarrollo 100% frontend (sin backend)
- ✅ HTML, CSS, JavaScript Vanilla sin frameworks
- ✅ Modelado claro de docentes, materias y grupos
- ✅ Asignación automática de horarios
- ✅ Detección de 4 tipos de conflictos
- ✅ Interfaz clara con botón y tabla
- ✅ Validaciones en todas las reglas obligatorias
- ✅ Código organizado en módulos
- ✅ Commits pequeños y descriptivos en Git
- ✅ Código sin `eval` y limpio

---

## 👨‍💻 Autor

Prueba técnica individual - Asignación de Horarios Académicos

---

## 📄 Licencia

Proyecto académico. Todos los derechos reservados.
