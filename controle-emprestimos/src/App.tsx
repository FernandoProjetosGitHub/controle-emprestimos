import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Clientes from "./pages/Clientes";
import Emprestimos from "./pages/Emprestimos";

function Layout() {
  const navigate = useNavigate();

  return (
    <Box>
      {/* 🔷 TOPO */}
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">
            Controle de Empréstimos
          </Typography>

          {/* 🔘 MENU */}
          <Box>
            <Button color="inherit" onClick={() => navigate("/")}>
              Clientes
            </Button>

            <Button color="inherit" onClick={() => navigate("/emprestimos")}>
              Empréstimos
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 📦 CONTEÚDO */}
      <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh", p: 2 }}>
        <Routes>
          <Route path="/" element={<Clientes />} />
          <Route path="/emprestimos" element={<Emprestimos />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;