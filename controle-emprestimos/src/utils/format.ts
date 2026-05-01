export function formatTelefone(value: string) {
  const numeros = value.replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 3) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  }
  if (numeros.length <= 7) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 3)}-${numeros.slice(3)}`;
  }

  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 3)}-${numeros.slice(3, 7)}-${numeros.slice(7)}`;
}

export function telefoneInvalido(value: string) {
  const numeros = value.replace(/\D/g, "");
  return numeros.length > 0 && numeros.length !== 11;
}

export function enderecoInvalido(value: string) {
  return value.length > 0 && (value.length < 3 || value.length > 255);
}
