import * as React from "react";
import {
  Avatar,
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import { AuthContext } from "../contexts/AuthContext";

// Standardizing the theme to match the Royal Blue style
const theme = createTheme({
  palette: {
    primary: {
      main: "#0B57D0",
    },
  },
});

export default function Authentication() {
  const [formState, setFormState] = useState(0); // 0 = Sign In, 1 = Sign Up
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const handleAuth = async () => {
    try {
      if (formState === 0) {
        await handleLogin(username, password);
      }
      if (formState === 1) {
        const result = await handleRegister(name, username, password);
        setMessage(result);
        setOpen(true);
        setUsername("");
        setPassword("");
        setFormState(0);
        setError("");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong";
      setError(msg);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAuth();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#F8F9FA", // Clean light grey background
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Container component="main" maxWidth="xs">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: "16px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E3E3E3",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Minimalist Icon */}
            <Avatar
              sx={{
                m: 1,
                bgcolor: "#F0F4F9",
                color: "#0B57D0",
                width: 50,
                height: 50,
              }}
            >
              <LockOutlinedIcon />
            </Avatar>

            <Typography
              component="h1"
              variant="h5"
              sx={{
                mb: 1,
                fontWeight: 500,
                color: "#1F1F1F",
              }}
            >
              {formState === 0 ? "Sign in" : "Create account"}
            </Typography>

            <Typography variant="body2" sx={{ color: "#444746", mb: 3 }}>
              Use your Zing Call Account
            </Typography>

            {/* Toggle Between Login/Signup */}
            <ToggleButtonGroup
              value={formState}
              exclusive
              onChange={(e, value) => {
                if (value !== null) {
                  setFormState(value);
                  setError("");
                }
              }}
              fullWidth
              sx={{
                mb: 2,
                "& .MuiToggleButton-root": {
                  textTransform: "none",
                  fontWeight: 500,
                  borderRadius: "8px",
                  py: 1,
                },
                "& .Mui-selected": {
                  bgcolor: "#D2E3FC !important",
                  color: "#0B57D0 !important",
                },
              }}
            >
              <ToggleButton value={0}>Login</ToggleButton>
              <ToggleButton value={1}>Register</ToggleButton>
            </ToggleButtonGroup>

            <Box component="form" noValidate sx={{ width: "100%" }}>
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Full Name"
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: "#F8F9FA",
                    },
                  }}
                />
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    bgcolor: "#F8F9FA",
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    bgcolor: "#F8F9FA",
                  },
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: "8px" }}>
                  {error}
                </Alert>
              )}

              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Button
                  onClick={() => setFormState(formState === 0 ? 1 : 0)}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  {formState === 0 ? "Create account" : "Sign in instead"}
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  disableElevation
                  onClick={handleAuth}
                  sx={{
                    px: 4,
                    py: 1.2,
                    borderRadius: "24px",
                    textTransform: "none",
                    fontWeight: 600,
                    bgcolor: "#0B57D0",
                    "&:hover": { bgcolor: "#0842A0" },
                  }}
                >
                  {formState === 0 ? "Next" : "Register"}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
      >
        <Alert onClose={() => setOpen(false)} severity="success">
          {message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
