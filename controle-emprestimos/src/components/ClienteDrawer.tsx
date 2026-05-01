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

function formatTelefone(value: string) {
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

function telefoneInvalido(value: string) {
  const numeros = value.replace(/\D/g, "");
  return numeros.length > 0 && numeros.length !== 11;
}

function enderecoInvalido(value: string) {
  return value.length > 0 && (value.length < 3 || value.length > 255);
}

export default function ClienteDrawer({ open, onClose, onSave }: Props) {
  const [nome, setNome] = useState("");
  const [juros, setJuros] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");

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

  function handleSave() {
    if (isInvalid) return;

    onSave({
      nome: nome.trim(),
      juros: Number(juros),
      telefone,
      endereco: endereco.trim(),
    });

    resetForm();
    onClose();
  }

  const isInvalid =
    !nome.trim() ||
    !juros ||
    Number(juros) < 0 ||
    telefoneInvalido(telefone) ||
    enderecoInvalido(endereco);

  return (
    <Drawer anchor="right" open={open} onClose={handleClose}>
      <Box
        sx={{
          width: { xs: 320, sm: 380 },
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          bgcolor: "background.paper",
          minHeight: "100%",
        }}
      >
        <Typography variant="h6">Novo Cliente</Typography>

        <TextField
          label="Nome"
          autoFocus
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          error={nome.length > 0 && !nome.trim()}
        />

        <TextField
          label="Juros (%)"
          type="number"
          value={juros}
          onChange={(e) => setJuros(e.target.value)}
          slotProps={{
            htmlInput: {
              min: 0,
              step: 0.01,
            },
          }}
        />

        <TextField
          label="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(formatTelefone(e.target.value))}
          error={telefoneInvalido(telefone)}
          helperText={telefoneInvalido(telefone) ? "Telefone incorreto" : ""}
        />

        <TextField
          label="Endereço"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          error={enderecoInvalido(endereco)}
          helperText={
            enderecoInvalido(endereco)
              ? "Endereço inválido: use entre 3 e 255 caracteres"
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
