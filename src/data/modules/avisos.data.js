const byName = (categorias, nombre) =>
  categorias.find((categoria) => categoria.nombre === nombre)?.categoriaID;

export const createDemoAvisos = (categorias = []) => [
  {
    avisoID: 1,
    usuarioID: 1,
    categoriaID: byName(categorias, "Mantenimiento") ?? 3,
    titulo: "Mantenimiento de porton principal",
    descripcion:
      "El porton principal estara en mantenimiento preventivo. El acceso peatonal seguira disponible.",
    fechaEvento: "2026-05-08T09:00:00.000Z",
    fechaPublicacion: "2026-05-05T15:00:00.000Z",
    usuarioNombre: "Administrador Demo",
  },
  {
    avisoID: 2,
    usuarioID: 1,
    categoriaID: byName(categorias, "Urgente") ?? 1,
    titulo: "Corte temporal de agua",
    descripcion:
      "Habra corte temporal de agua por reparacion de tuberia en la calle central.",
    fechaEvento: "2026-05-07T14:00:00.000Z",
    fechaPublicacion: "2026-05-05T16:30:00.000Z",
    usuarioNombre: "Administrador Demo",
  },
  {
    avisoID: 3,
    usuarioID: 1,
    categoriaID: byName(categorias, "Eventos") ?? 5,
    titulo: "Reunion vecinal",
    descripcion:
      "Se convoca a reunion vecinal para revisar acuerdos de seguridad y mantenimiento.",
    fechaEvento: "2026-05-10T18:30:00.000Z",
    fechaPublicacion: "2026-05-04T20:00:00.000Z",
    usuarioNombre: "Administrador Demo",
  },
  {
    avisoID: 4,
    usuarioID: 1,
    categoriaID: byName(categorias, "Pagos") ?? 4,
    titulo: "Pago de mantenimiento",
    descripcion:
      "Recordatorio de pago de mantenimiento mensual. Favor de cubrirlo antes del dia 12.",
    fechaEvento: "2026-05-12T23:59:00.000Z",
    fechaPublicacion: "2026-05-03T13:00:00.000Z",
    usuarioNombre: "Administrador Demo",
  },
  {
    avisoID: 5,
    usuarioID: 1,
    categoriaID: byName(categorias, "Mantenimiento") ?? 3,
    titulo: "Fumigacion programada",
    descripcion:
      "La fumigacion de areas comunes se realizara por la manana. Evita dejar mascotas sueltas.",
    fechaEvento: "2026-05-14T08:00:00.000Z",
    fechaPublicacion: "2026-05-02T17:15:00.000Z",
    usuarioNombre: "Administrador Demo",
  },
  {
    avisoID: 6,
    usuarioID: 1,
    categoriaID: byName(categorias, "General") ?? 6,
    titulo: "Actualizacion de reglamento",
    descripcion:
      "Ya esta disponible la actualizacion del reglamento interno para consulta de residentes.",
    fechaEvento: null,
    fechaPublicacion: "2026-05-01T18:45:00.000Z",
    usuarioNombre: "Administrador Demo",
  },
  {
    avisoID: 7,
    usuarioID: 1,
    categoriaID: byName(categorias, "Seguridad") ?? 2,
    titulo: "Reparacion de alumbrado",
    descripcion:
      "Se repararan luminarias en acceso norte y andadores para mejorar la visibilidad nocturna.",
    fechaEvento: "2026-05-09T19:00:00.000Z",
    fechaPublicacion: "2026-04-30T12:00:00.000Z",
    usuarioNombre: "Administrador Demo",
  },
  {
    avisoID: 8,
    usuarioID: 1,
    categoriaID: byName(categorias, "General") ?? 6,
    titulo: "Horario de recoleccion de basura",
    descripcion:
      "La recoleccion sera lunes, miercoles y viernes a partir de las 7:00 a.m.",
    fechaEvento: null,
    fechaPublicacion: "2026-04-29T11:30:00.000Z",
    usuarioNombre: "Administrador Demo",
  },
  {
    avisoID: 9,
    usuarioID: 1,
    categoriaID: byName(categorias, "General") ?? 6,
    titulo: "Uso de amenidades",
    descripcion:
      "Recuerda reservar amenidades con anticipacion y dejar el espacio limpio al terminar.",
    fechaEvento: null,
    fechaPublicacion: "2026-04-28T21:00:00.000Z",
    usuarioNombre: "Administrador Demo",
  },
  {
    avisoID: 10,
    usuarioID: 1,
    categoriaID: byName(categorias, "Seguridad") ?? 2,
    titulo: "Simulacro de emergencia",
    descripcion:
      "Se realizara simulacro de emergencia en coordinacion con vigilancia y administracion.",
    fechaEvento: "2026-05-16T10:00:00.000Z",
    fechaPublicacion: "2026-04-27T16:00:00.000Z",
    usuarioNombre: "Administrador Demo",
  },
];
