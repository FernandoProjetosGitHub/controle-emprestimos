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
  }) => boolean;
};

export default function ClienteDrawer({ open, onClose, onSave }: Props) {
  const [nome, setNome] = useState("");
  const [juros, setJuros] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");

  const nomeLimpo = nome.trim();
  const enderecoLimpo = endereco.trim();
  const nomeErro = !nomeLimpo ? "Informe o nome do cliente" : "";
  const jurosErro =
    !juros || Number.isNaN(Number(juros)) || Number(juros) < 0
      ? "Informe uma taxa de juros valida"
      : "";
  const telefoneErro = !telefone
    ? "Informe o telefone do cliente"
    : telefoneInvalido(telefone)
      ? "Informe um telefone com DDD e 11 digitos"
      : "";
  const enderecoErro = !enderecoLimpo
    ? "Informe o endereco do cliente"
    : enderecoInvalido(endereco)
      ? "Use um endereco entre 3 e 255 caracteres"
      : "";
  const isInvalid = !!(nomeErro || jurosErro || telefoneErro || enderecoErro);

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

    const saved = onSave({
      nome: nomeLimpo,
      juros: Number(juros),
      telefone,
      endereco: enderecoLimpo,
    });

    if (!saved) return;

    resetForm();
    onClose();
  }

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
          error={!!nomeErro}
          helperText={nomeErro}
        />

        <TextField
          label="Juros (%)"
          type="number"
          value={juros}
          onChange={(e) => setJuros(e.target.value)}
          error={!!jurosErro}
          helperText={jurosErro}
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
          error={!!telefoneErro}
          helperText={telefoneErro}
        />

        <TextField
          label="Endereco"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          error={!!enderecoErro}
          helperText={enderecoErro}
        />

        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Button variant="outlined" onClick={handleClose} sx={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isInvalid}
            sx={{ flex: 1 }}
          >
            Salvar
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
