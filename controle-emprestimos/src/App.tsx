import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import DashboardTwoToneIcon from "@mui/icons-material/DashboardTwoTone";
import GroupTwoToneIcon from "@mui/icons-material/GroupTwoTone";
import AccountBalanceWalletTwoToneIcon from "@mui/icons-material/AccountBalanceWalletTwoTone";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Clientes from "./pages/Clientes";
import Emprestimos from "./pages/Emprestimos";
import Resumo from "./pages/Resumo";
import { appTheme, colors } from "./theme";

const menuItems = [
  { label: "Resumo", path: "/resumo", icon: <DashboardTwoToneIcon /> },
  { label: "Clientes", path: "/", icon: <GroupTwoToneIcon /> },
  {
    label: "Empréstimos",
    path: "/emprestimos",
    icon: <AccountBalanceWalletTwoToneIcon />,
  },
];

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        component="aside"
        sx={{
          width: { xs: 86, sm: 240 },
          flexShrink: 0,
          bgcolor: colors.petroleum,
          color: "white",
          display: "flex",
          flexDirection: "column",
          px: { xs: 1, sm: 2 },
          py: 3,
          boxShadow: "4px 0 18px rgba(15, 23, 42, 0.16)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            px: 1,
            mb: 3,
            fontWeight: 700,
            lineHeight: 1.2,
            display: { xs: "none", sm: "block" },
          }}
        >
          Controle de Empréstimos
        </Typography>

        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: 700,
            textAlign: "center",
            display: { xs: "block", sm: "none" },
          }}
        >
          CE
        </Typography>

        <List sx={{ display: "grid", gap: 1 }}>
          {menuItems.map((item) => {
            const selected = location.pathname === item.path;

            return (
              <ListItemButton
                key={item.path}
                selected={selected}
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  borderRadius: 1,
                  color: selected ? colors.petroleum : "rgba(255,255,255,0.84)",
                  bgcolor: selected ? "white" : "transparent",
                  justifyContent: { xs: "center", sm: "flex-start" },
                  "&:hover": {
                    bgcolor: selected ? "white" : "rgba(255,255,255,0.1)",
                  },
                  "&.Mui-selected": {
                    bgcolor: "white",
                  },
                  "&.Mui-selected:hover": {
                    bgcolor: "white",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "inherit",
                    minWidth: { xs: 0, sm: 40 },
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: selected ? 700 : 500 }}>
                      {item.label}
                    </Typography>
                  }
                  sx={{ display: { xs: "none", sm: "block" } }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Routes>
          <Route path="/" element={<Clientes />} />
          <Route path="/emprestimos" element={<Emprestimos />} />
          <Route path="/resumo" element={<Resumo />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
