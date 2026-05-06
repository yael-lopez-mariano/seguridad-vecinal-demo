export const createDemoAmenidades = (tiposAmenidad = []) => {
  const tipoByName = (name) =>
    tiposAmenidad.find((tipo) =>
      String(tipo.nombre || "")
        .toLowerCase()
        .includes(String(name).toLowerCase())
    ) || tiposAmenidad[0];

  const gimnasio = tipoByName("Gimnasio");
  const alberca = tipoByName("Alberca");
  const salon = tipoByName("Salon");
  const cancha = tipoByName("Cancha");

  return [
    {
      amenidadID: 1,
      tipoAmenidadID: salon?.tipoAmenidadID ?? 3,
      nombre: "Salon de eventos",
      ubicacion: "Casa club, planta baja",
      capacidad: 80,
      activo: true,
    },
    {
      amenidadID: 2,
      tipoAmenidadID: cancha?.tipoAmenidadID ?? 4,
      nombre: "Cancha deportiva",
      ubicacion: "Zona norte",
      capacidad: 24,
      activo: true,
    },
    {
      amenidadID: 3,
      tipoAmenidadID: cancha?.tipoAmenidadID ?? 4,
      nombre: "Area de juegos",
      ubicacion: "Parque central",
      capacidad: 30,
      activo: true,
    },
    {
      amenidadID: 4,
      tipoAmenidadID: salon?.tipoAmenidadID ?? 3,
      nombre: "Palapa",
      ubicacion: "Jardin posterior",
      capacidad: 35,
      activo: true,
    },
    {
      amenidadID: 5,
      tipoAmenidadID: gimnasio?.tipoAmenidadID ?? 1,
      nombre: "Gimnasio",
      ubicacion: "Casa club, segundo nivel",
      capacidad: 18,
      activo: true,
    },
    {
      amenidadID: 6,
      tipoAmenidadID: alberca?.tipoAmenidadID ?? 2,
      nombre: "Alberca",
      ubicacion: "Zona recreativa",
      capacidad: 40,
      activo: true,
    },
    {
      amenidadID: 7,
      tipoAmenidadID: salon?.tipoAmenidadID ?? 3,
      nombre: "Terraza",
      ubicacion: "Casa club, azotea",
      capacidad: 45,
      activo: true,
    },
    {
      amenidadID: 8,
      tipoAmenidadID: salon?.tipoAmenidadID ?? 3,
      nombre: "Area de asadores",
      ubicacion: "Jardin comun",
      capacidad: 28,
      activo: true,
    },
  ];
};
