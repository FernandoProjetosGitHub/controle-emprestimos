import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import LoginTwoToneIcon from "@mui/icons-material/LoginTwoTone";
import PersonAddAltTwoToneIcon from "@mui/icons-material/PersonAddAltTwoTone";
import { colors } from "../theme";
import { useAuth } from "../contexts/AuthContext";

type FormMode = "entrar" | "criar";

const brandLogo = `${import.meta.env.BASE_URL}brand-jurista.png`;

const firebaseErrorMessage: Record<string, string> = {
  "auth/email-already-in-use": "Este email ja possui uma conta.",
  "auth/invalid-email": "Digite um email valido.",
  "auth/invalid-credential": "Email ou senha incorretos.",
  "auth/user-not-found": "Email ou senha incorretos.",
  "auth/wrong-password": "Email ou senha incorretos.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 digitos.",
  "auth/operation-not-allowed": "Ative o login por email e senha no Firebase.",
};

function getFirebaseMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  return firebaseErrorMessage[code] ?? "Nao foi possivel concluir o acesso agora.";
}

function getPasswordScore(password: string) {
  if (!password) return 0;

  let score = password.length >= 6 ? 1 : 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return Math.min(score, 4);
}

export default function Acesso() {
  const { login, createAccount } = useAuth();
  const [mode, setMode] = useState<FormMode>("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const passwordScore = useMemo(() => getPasswordScore(password), [password]);
  const passwordStrength = useMemo(() => {
    if (!password) return { label: "Digite uma senha", color: colors.muted, value: 0 };
    if (passwordScore <= 1) return { label: "Senha fraca", color: colors.error, value: 30 };
    if (passwordScore <= 3) return { label: "Senha media", color: colors.warning, value: 65 };
    return { label: "Senha forte", color: colors.success, value: 100 };
  }, [password, passwordScore]);

  function validate() {
    const cleanEmail = email.trim();

    if (!cleanEmail || !password || (mode === "criar" && !repeatPassword)) {
      return "Preencha todos os campos.";
    }

    if (password.length < 6) {
      return "A senha precisa ter no minimo 6 digitos.";
    }

    if (mode === "criar" && password !== repeatPassword) {
      return "As senhas precisam ser iguais.";
    }

    return "";
  }

  async function handleSubmit(action: FormMode) {
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy(true);
    try {
      if (action === "criar") {
        await createAccount(email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      setError(getFirebaseMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "grid",
        alignItems: "center",
        px: 2,
        py: 4,
      }}
    >
      <Container maxWidth="xs" disableGutters>
        <Paper
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 2,
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 2.5 }}>
            <Box
              component="img"
              src={brandLogo}
              alt="Jurista"
              sx={{
                width: 104,
                height: 104,
                display: "block",
                mx: "auto",
                mb: 1.5,
                borderRadius: "50%",
                filter: "drop-shadow(0 10px 20px rgba(18, 48, 71, 0.16))",
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Controle de emprestimos com sincronizacao para desktop e celular.
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gap: 1.5 }}>
            <TextField
              autoFocus
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <TextField
              label="Senha"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleSubmit(mode);
              }}
            />

            {mode === "criar" && (
              <>
                <TextField
                  label="Repetir senha"
                  type="password"
                  value={repeatPassword}
                  onChange={(event) => setRepeatPassword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void handleSubmit("criar");
                  }}
                />
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                    <Typography variant="caption" color="text.secondary">
                      Seguranca da senha
                    </Typography>
                    <Typography variant="caption" sx={{ color: passwordStrength.color, fontWeight: 700 }}>
                      {passwordStrength.label}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength.value}
                    sx={{
                      height: 10,
                      borderRadius: 1,
                      bgcolor: colors.border,
                      "& .MuiLinearProgress-bar": {
                        bgcolor: passwordStrength.color,
                        borderRadius: 1,
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                    Use no minimo 6 digitos. Letras, numeros e simbolos deixam a senha melhor.
                  </Typography>
                </Box>
              </>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              variant="contained"
              startIcon={<LoginTwoToneIcon />}
              disabled={busy}
              onClick={() => void handleSubmit("entrar")}
            >
              Entrar
            </Button>
            <Button
              variant={mode === "criar" ? "contained" : "outlined"}
              startIcon={<PersonAddAltTwoToneIcon />}
              disabled={busy}
              onClick={() => {
                if (mode === "criar") {
                  void handleSubmit("criar");
                  return;
                }

                setMode("criar");
                setError("");
              }}
              sx={
                mode === "criar"
                  ? {
                      bgcolor: colors.warning,
                      color: colors.petroleumDark,
                      "&:hover": { bgcolor: colors.warning, filter: "brightness(0.96)" },
                    }
                  : undefined
              }
            >
              Criar conta
            </Button>

            {mode === "criar" && (
              <Button
                variant="text"
                onClick={() => {
                  setMode("entrar");
                  setRepeatPassword("");
                  setError("");
                }}
              >
                Voltar para entrar
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
