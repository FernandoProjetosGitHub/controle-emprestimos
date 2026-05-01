import { Box, Button, Typography } from "@mui/material";
import type { ReactNode } from "react";

// 📌 informações que o componente recebe
type Props = {
  mensagem: string;      // texto explicativo
  textoBotao: string;    // texto do botão de ação
  onAcao: () => void;    // função chamada ao clicar no botão
  icone: ReactNode;      // ícone a exibir — ReactNode aceita qualquer elemento JSX
};

export default function TabelaVazia({ mensagem, textoBotao, onAcao, icone }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column", // empilha os elementos verticalmente
        alignItems: "center",    // centraliza horizontalmente
        justifyContent: "center",
        py: 8,                   // espaçamento vertical generoso
        gap: 2,                  // espaço entre cada elemento
        color: "text.secondary", // cor cinza suave
      }}
    >
      {/* ícone grande */}
      <Box sx={{ fontSize: 64, lineHeight: 1, opacity: 0.3 }}>
        {icone}
      </Box>

      {/* mensagem */}
      <Typography variant="body1" color="text.secondary">
        {mensagem}
      </Typography>

      {/* botão de ação */}
      <Button variant="contained" onClick={onAcao}>
        {textoBotao}
      </Button>
    </Box>
  );
}