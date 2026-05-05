import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  TextField,
  Typography,
} from "@mui/material";
import CloudDoneTwoToneIcon from "@mui/icons-material/CloudDoneTwoTone";
import CloudOffTwoToneIcon from "@mui/icons-material/CloudOffTwoTone";
import SyncTwoToneIcon from "@mui/icons-material/SyncTwoTone";
import LoginTwoToneIcon from "@mui/icons-material/LoginTwoTone";
import LogoutTwoToneIcon from "@mui/icons-material/LogoutTwoTone";
import { colors } from "../theme";
import { useAuth } from "../contexts/AuthContext";

const statusText = {
  local: "Modo local",
  carregando: "Conectando",
  sincronizado: "Sincronizado",
  salvando: "Salvando",
  erro: "Erro de sync",
};

export default function AuthBar() {
  const { user, loading, syncStatus, login, logout, forceSync } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    try {
      await login(email, password);
      setPassword("");
      setOpen(false);
    } catch {
      setError("Não foi possível entrar. Verifique email e senha.");
    }
  }

  const connected = !!user;

  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 3 },
        pt: { xs: 1.5, sm: 2 },
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          border: `1px solid ${colors.border}`,
          bgcolor: "background.paper",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <Chip
            icon={connected ? <CloudDoneTwoToneIcon /> : <CloudOffTwoToneIcon />}
            label={loading ? "Carregando" : statusText[syncStatus]}
            size="small"
            sx={{
              bgcolor: connected ? colors.successLight : colors.warningLight,
              color: connected ? colors.success : colors.warning,
              fontWeight: 700,
            }}
          />
          <Typography variant="body2" color="text.secondary" noWrap>
            {connected ? user.email : "Entre para sincronizar celular e desktop"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}>
          {connected ? (
            <>
              <Button
                variant="outlined"
                startIcon={<SyncTwoToneIcon />}
                onClick={() => void forceSync()}
                sx={{ flex: { xs: 1, sm: "initial" } }}
              >
                Sincronizar
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutTwoToneIcon />}
                onClick={() => void logout()}
                sx={{ flex: { xs: 1, sm: "initial" } }}
              >
                Sair
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<LoginTwoToneIcon />}
              onClick={() => setOpen((value) => !value)}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Entrar
            </Button>
          )}
        </Box>
      </Box>

      <Collapse in={open && !connected}>
        <Box
          sx={{
            mt: 1,
            p: 2,
            borderRadius: 2,
            border: `1px solid ${colors.border}`,
            bgcolor: "background.paper",
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 240 } }}
          />
          <TextField
            size="small"
            label="Senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void handleLogin();
            }}
            sx={{ minWidth: { xs: "100%", sm: 180 } }}
          />
          <Button
            variant="contained"
            onClick={() => void handleLogin()}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Conectar
          </Button>
          {error && (
            <Typography variant="body2" sx={{ width: "100%", color: colors.error }}>
              {error}
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
