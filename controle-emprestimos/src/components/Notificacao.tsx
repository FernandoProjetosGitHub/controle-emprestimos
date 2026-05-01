import { Alert, Snackbar } from "@mui/material";
import { colors } from "../theme";

type Props = {
  mensagem: string;
  aberto: boolean;
  onFechar: () => void;
  tipo: "erro" | "aviso" | "sucesso";
};

const severityByTipo = {
  erro: "error",
  aviso: "warning",
  sucesso: "success",
} as const;

const colorByTipo = {
  erro: colors.error,
  aviso: colors.warning,
  sucesso: colors.success,
};

export default function Notificacao({ mensagem, aberto, onFechar, tipo }: Props) {
  return (
    <Snackbar
      open={aberto}
      autoHideDuration={4000}
      onClose={onFechar}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
    >
      <Alert
        onClose={onFechar}
        severity={severityByTipo[tipo]}
        variant="filled"
        sx={{
          width: "100%",
          bgcolor: colorByTipo[tipo],
          color: tipo === "aviso" ? colors.petroleumDark : "#fff",
          fontWeight: 600,
        }}
      >
        {mensagem}
      </Alert>
    </Snackbar>
  );
}
