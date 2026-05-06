// src/context/Amenidades/AmenidadesContext.js
import { createContext, useContext } from "react";

const AmenidadesContext = createContext(null);

export default AmenidadesContext;

/**
 * Hook de comodidad para usar el contexto:
 * const { amenidades, cargarAmenidades } = useAmenidades();
 */
export const useAmenidades = () => {
  const ctx = useContext(AmenidadesContext);
  if (!ctx) {
    throw new Error(
      "useAmenidades debe usarse dentro de <AmenidadesState> (provider)"
    );
  }
  return ctx;
};
