import { Box, Button, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { colors } from "../theme";

type Props = {
  mensagem: string;
  textoBotao: string;
  onAcao: () => void;
  icone: ReactNode;
};

export default function TabelaVazia({ mensagem, textoBotao, onAcao, icone }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
        px: 2,
        gap: 2,
        color: "text.secondary",
        textAlign: "center",
      }}
    >
      <Box sx={{ fontSize: 64, lineHeight: 1, color: colors.petroleum, opacity: 0.28 }}>
        {icone}
      </Box>

      <Typography variant="body1" color="text.secondary">
        {mensagem}
      </Typography>

      <Button variant="contained" onClick={onAcao}>
        {textoBotao}
      </Button>
    </Box>
  );
}
