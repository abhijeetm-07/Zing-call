import React, { useState, useContext } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router";
import {
  Button,
  TextField,
  Typography,
  Box,
  Container,
  Paper,
  IconButton,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import VideocamIcon from "@mui/icons-material/Videocam";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [error, setError] = useState("");
  const { handleLogout } = useContext(AuthContext);

  const handleJoinVideoCall = () => {
    if (meetingCode.trim()) {
      setError("");
      navigate(`/${meetingCode}`);
    } else {
      setError("Please enter a meeting code");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navbar with subtle shadow */}
      <Box
        component="nav"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 2, md: 6 },
          py: 2,
          bgcolor: "#FFFFFF",
          borderBottom: "1px solid #F1F3F4",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <VideocamIcon sx={{ fontSize: 32, color: "#0B57D0" }} />
          <Typography
            variant="h5"
            sx={{ fontWeight: 500, color: "#444746", letterSpacing: -0.5 }}
          >
            <Box component="span" sx={{ color: "#0B57D0", fontWeight: 700 }}>
              Zing
            </Box>{" "}
            Call
          </Typography>
        </Box>
        <Tooltip title="Sign Out">
          <IconButton
            onClick={handleLogout}
            sx={{ border: "1px solid #D2E3FC", bgcolor: "#F8FAFF" }}
          >
            <LogoutIcon sx={{ color: "#0B57D0", fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{ flex: 1, display: "flex", alignItems: "center", py: 4 }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
            gap: { xs: 6, md: 10 },
            alignItems: "center",
          }}
        >
          {/* Action Side */}
          <Box>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 400,
                color: "#1F1F1F",
                mb: 3,
                fontSize: { xs: "2.4rem", md: "3.2rem" },
                lineHeight: 1.2,
              }}
            >
              Video calls and meetings <br />
              <Box component="span" sx={{ color: "#0B57D0", fontWeight: 600 }}>
                for everyone.
              </Box>
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: "#474747",
                mb: 6,
                fontWeight: 300,
                maxWidth: "480px",
                lineHeight: 1.6,
              }}
            >
              Connect, collaborate, and celebrate from anywhere with Zing Call.
              High-quality video conferencing, now accessible to all.
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
              }}
            >
              <Button
                variant="contained"
                disableElevation
                startIcon={<VideocamIcon />}
                onClick={() =>
                  setMeetingCode(Math.random().toString(36).substring(7))
                }
                sx={{
                  height: 52,
                  px: 4,
                  bgcolor: "#0B57D0",
                  textTransform: "none",
                  borderRadius: "26px",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  "&:hover": { bgcolor: "#0842A0" },
                }}
              >
                New Meeting
              </Button>

              <Box sx={{ position: "relative" }}>
                <TextField
                  value={meetingCode}
                  onChange={(e) => {
                    setMeetingCode(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter a code"
                  variant="outlined"
                  error={!!error}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyboardIcon sx={{ color: "#747775" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    width: { xs: "100%", sm: 220 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: "#F8F9FA",
                      "& fieldset": { borderColor: "#747775" },
                      "&:hover fieldset": { borderColor: "#0B57D0" },
                    },
                  }}
                />
              </Box>

              <Button
                onClick={handleJoinVideoCall}
                disabled={!meetingCode.trim()}
                sx={{
                  height: 52,
                  fontWeight: 700,
                  color: meetingCode.trim() ? "#0B57D0" : "#C4C7C5",
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                Join
              </Button>
            </Box>

            <Box sx={{ borderTop: "1px solid #E3E3E3", mt: 6, pt: 3 }}>
              <Typography variant="body2" sx={{ color: "#444746" }}>
                <Box
                  component="span"
                  sx={{ color: "#0B57D0", fontWeight: 600, cursor: "pointer" }}
                >
                  Learn more
                </Box>{" "}
                about our secure encryption.
              </Typography>
            </Box>
          </Box>

          {/* Visual Side */}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Paper
              elevation={0}
              sx={{
                width: 440,
                height: 440,
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#F0F4F9",
                border: "2px dashed #D2E3FC",
              }}
            >
              <img
                src="/logo3.png"
                alt="Illustration"
                style={{
                  width: "75%",
                  height: "auto",
                  filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.05))",
                }}
              />
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default withAuth(HomeComponent);
