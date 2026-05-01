import { Box, Button, Drawer, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { enderecoInvalido, formatTelefone, telefoneInvalido } from "../utils/format";

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
          width: { xs: "100vw", sm: 380 },
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
