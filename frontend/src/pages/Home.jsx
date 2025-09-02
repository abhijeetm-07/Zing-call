import React, { useState, useContext } from "react"; // Import useContext
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router";
import { Button, IconButton, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import "../App.css";
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  const { handleLogout } = useContext(AuthContext);

  const handleJoinVideoCall = () => {
    if (meetingCode.trim()) {
      navigate(`/${meetingCode}`);
    }
  };

  return (
    <>
      <div className="navBar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2>Zing Call</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          

          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </div>

      <div className="meetContainer">
        <div className="leftPanel">
          <div>
            <h2>Providing High Quality Video Conferencing</h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <TextField
                onChange={(e) => setMeetingCode(e.target.value)}
                id="outlined-basic"
                label="Meeting Code"
                variant="outlined"
              />
              <Button onClick={handleJoinVideoCall} variant="contained">
                Join
              </Button>
            </div>
          </div>
        </div>
        <div className='rightPanel'>
                    <img srcSet='/logo3.png' alt="" />
                </div>
      </div>
    </>
  );
}

export default withAuth(HomeComponent);
