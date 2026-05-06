import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import type { Cliente } from "../types/cliente";
import { colors } from "../theme";
import { enderecoInvalido, formatTelefone, telefoneInvalido } from "../utils/format";

type Props = {
  open: boolean;
  cliente: Cliente | null;
  onClose: () => void;
  onChange: (cliente: Cliente) => void;
  onSave: () => void;
};

export default function EditClienteDialog({
  open,
  cliente,
  onClose,
  onChange,
  onSave,
}: Props) {
  if (!cliente) return null;

  const telefone = cliente.telefone ?? "";
  const endereco = cliente.endereco ?? "";
  const nomeErro = !cliente.nome.trim() ? "Informe o nome do cliente" : "";
  const jurosErro =
    Number.isNaN(cliente.juros) || cliente.juros < 0
      ? "Informe uma taxa valida"
      : "";
  const telefoneErro = !telefone
    ? "Informe o telefone do cliente"
    : telefoneInvalido(telefone)
      ? "Informe um telefone com DDD e 11 digitos"
      : "";
  const enderecoErro = !endereco.trim()
    ? "Informe o endereco do cliente"
    : enderecoInvalido(endereco)
      ? "Use um endereco entre 3 e 255 caracteres"
      : "";
  const formInvalido = !!(nomeErro || jurosErro || telefoneErro || enderecoErro);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: { borderRadius: 2, mx: 1.5 },
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <EditTwoToneIcon sx={{ color: colors.petroleum }} />
        Editar cliente
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Nome"
            fullWidth
            value={cliente.nome}
            onChange={(e) => onChange({ ...cliente, nome: e.target.value })}
            error={!!nomeErro}
            helperText={nomeErro}
          />

          <TextField
            label="Juros (%)"
            type="number"
            fullWidth
            value={cliente.juros}
            onChange={(e) =>
              onChange({ ...cliente, juros: Number(e.target.value) })
            }
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
            fullWidth
            value={telefone}
            onChange={(e) =>
              onChange({ ...cliente, telefone: formatTelefone(e.target.value) })
            }
            error={!!telefoneErro}
            helperText={telefoneErro}
          />

          <TextField
            label="Endereco"
            fullWidth
            value={endereco}
            onChange={(e) => onChange({ ...cliente, endereco: e.target.value })}
            error={!!enderecoErro}
            helperText={enderecoErro}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={formInvalido}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
