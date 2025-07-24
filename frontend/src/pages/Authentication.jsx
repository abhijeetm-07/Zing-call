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
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import { AuthContext } from "../contexts/AuthContext";

const theme = createTheme();

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
        console.log(result);
        setMessage(result);
        setOpen(true);
        setUsername("");
        setPassword("");
        setFormState(0);
        setError("");
      }
    } catch (err) {
      console.log(err);
      const msg = err?.response?.data?.message || "Something went wrong";
      setError(msg);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Container component="main" maxWidth="xs">
          <Paper
            elevation={10}
            sx={{
              p: 4,
              borderRadius: 4,
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "#d97500" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography
              component="h1"
              variant="h5"
              sx={{ mb: 2, fontWeight: "bold" }}
            >
              {formState === 0 ? "Sign In" : "Sign Up"}
            </Typography>

            <ToggleButtonGroup
              value={formState}
              exclusive
              onChange={(e, value) => {
                if (value !== null) setFormState(value);
              }}
              fullWidth
              sx={{ mb: 3 }}
            >
              <ToggleButton value={0} sx={{ textTransform: "none" }}>
                Sign In
              </ToggleButton>
              <ToggleButton value={1} sx={{ textTransform: "none" }}>
                Sign Up
              </ToggleButton>
            </ToggleButtonGroup>

            <Box component="form" noValidate sx={{ mt: 1 }}>
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                autoComplete="username"
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                value={password}
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <Typography color="error">{error}</Typography>}

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  py: 1.5,
                  fontWeight: "bold",
                  backgroundColor: "#d97500",
                  "&:hover": {
                    backgroundColor: "#b75d00",
                  },
                }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Login" : "Register"}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        message={message}
      />
    </ThemeProvider>
  );
}
