import { Box, Button, Drawer, TextField, Typography } from "@mui/material";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (cliente: {
    nome: string;
    juros: number;
    telefone: string;
    endereco: string;
  }) => void;
};

export default function ClienteDrawer({ open, onClose, onSave }: Props) {
  const [nome, setNome] = useState("");
  const [juros, setJuros] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");

  function handleSave() {
    if (!nome || !juros) return;

    onSave({
      nome,
      juros: Number(juros),
      telefone,
      endereco,
    });

    // reset
    setNome("");
    setJuros("");
    setTelefone("");
    setEndereco("");
    onClose();
  }
  function formatTelefone(value: string) {
    const numeros = value.replace(/\D/g, "").slice(0, 11);

    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 3)
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 7)
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 3)}-${numeros.slice(3)}`;

    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 3)}-${numeros.slice(3, 7)}-${numeros.slice(7)}`;
  }
  function telefoneInvalido(value: string) {
    const numeros = value.replace(/\D/g, "");
    return numeros.length !== 11;
  }
  function enderecoInvalido(value: string) {
    return value.length < 3 || value.length > 255;
  }
  function resetForm() {
    setNome("");
    setJuros("");
    setTelefone("");
    setEndereco("");
  }
  function handleClose() {
    resetForm();
    onClose();
  }
  const isInvalid =
    !nome.trim() ||
    !juros ||
    telefoneInvalido(telefone) ||
    enderecoInvalido(endereco);
  return (
    <Drawer anchor="right" open={open} onClose={handleClose}>
      <Box
        sx={{
          width: 360,
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6">Novo Cliente</Typography>

        <TextField
          label="Nome"
          autoFocus
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <TextField
          label="Juros (%)"
          type="number"
          value={juros}
          onChange={(e) => setJuros(e.target.value)}
        />

        <TextField
          label="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(formatTelefone(e.target.value))}
          error={telefone.length > 0 && telefoneInvalido(telefone)}
          helperText={
            telefone.length > 0 && telefoneInvalido(telefone)
              ? "Telefone incorreto"
              : ""
          }
        />

        <TextField
          label="Endereço"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          error={endereco.length > 0 && enderecoInvalido(endereco)}
          helperText={
            endereco.length > 0 && enderecoInvalido(endereco)
              ? "Endereço inválido (mín. 3, máx. 255 caracteres)"
              : ""
          }
        />

        <Button variant="contained" onClick={handleSave} disabled={isInvalid}>
          Salvar Cliente
        </Button>
      </Box>
    </Drawer>
  );
}
