import Swal from "sweetalert2";

const baseOptions = {
  confirmButtonColor: "#059669",
  cancelButtonColor: "#64748b",
};

export const showSuccess = (title, text) =>
  Swal.fire({
    ...baseOptions,
    icon: "success",
    title,
    text,
  });

export const showAutoSuccess = (title, text, timer = 1100) =>
  Swal.fire({
    ...baseOptions,
    icon: "success",
    title,
    text,
    timer,
    timerProgressBar: true,
    showConfirmButton: false,
  });

export const showError = (
  title = "Error",
  text = "Ocurrio un problema al procesar la accion."
) =>
  Swal.fire({
    ...baseOptions,
    icon: "error",
    title,
    text,
  });

export const showWarning = (title, text) =>
  Swal.fire({
    ...baseOptions,
    icon: "warning",
    title,
    text,
  });

export const confirmAction = ({
  title,
  text,
  confirmButtonText = "Confirmar",
  cancelButtonText = "Cancelar",
}) =>
  Swal.fire({
    ...baseOptions,
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true,
  });
