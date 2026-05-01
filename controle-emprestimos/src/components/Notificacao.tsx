import { Snackbar, Alert } from "@mui/material";

// 📌 definição das informações que o componente recebe
type Props = {
  mensagem: string;           // texto que aparece na notificação
  aberto: boolean;            // true = visível, false = escondido
  onFechar: () => void;       // função chamada quando a notificação fecha
  tipo: "erro" | "aviso" | "sucesso"; // controla a cor
};

export default function Notificacao({ mensagem, aberto, onFechar, tipo }: Props) {
  return (
    <Snackbar
      open={aberto}
      autoHideDuration={4000}   // some automaticamente após 4 segundos
      onClose={onFechar}        // também fecha se o usuário clicar no X
      anchorOrigin={{
        vertical: "bottom",     // posição vertical: embaixo
        horizontal: "center",   // posição horizontal: centro
      }}
    >
      {/*
        Alert é o componente visual colorido dentro do Snackbar
        severity recebe o tipo mas o MUI usa nomes em inglês,
        então fazemos a tradução aqui mesmo
      */}
      <Alert
        onClose={onFechar}
        severity={
          tipo === "erro"    ? "error"   :
          tipo === "aviso"   ? "warning" :
          "success"                        // tipo === "sucesso"
        }
        variant="filled"  // fundo colorido sólido, mais fácil de ver
        sx={{ width: "100%" }}
      >
        {mensagem}
      </Alert>
    </Snackbar>
  );
}