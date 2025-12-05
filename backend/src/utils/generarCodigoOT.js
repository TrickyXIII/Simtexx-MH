export const generarCodigoOT = () => {
  const prefijo = "OT";
  const numero = Math.floor(100000 + Math.random() * 900000);
  return `${prefijo}-${numero}`;
};
