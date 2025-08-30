import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import styles from "../styles/videoComponent.module.css";

import { Badge, TextField, Button, IconButton } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";

const server_url = "http://localhost:8000";
const connections = {};

const peerConfigConnections = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();
  const localStreamRef = useRef(null);

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [askForUserName, setAskForUserName] = useState(true);
  const [userName, setUserName] = useState("");
  const [videos, setVideos] = useState([]);

  const videoRef = useRef([]);
  const screenShareStreamRef = useRef(null);

  // Helper functions for black video and silence audio
  const silence = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    const track = dst.stream.getAudioTracks()[0];
    track.enabled = false;
    return track;
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    const canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
    const stream = canvas.captureStream();
    const track = stream.getVideoTracks()[0];
    return track;
  };

  const blackSilence = () => new MediaStream([black(), silence()]);

  const getPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (stream) {
        setVideoAvailable(true);
        setAudioAvailable(true);
        localStreamRef.current = stream;
        window.localStream = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }
    } catch (error) {
      console.error("Permission error:", error);
      setVideoAvailable(false);
      setAudioAvailable(false);
      
      // Create black/silence stream as fallback
      const fallbackStream = blackSilence();
      localStreamRef.current = fallbackStream;
      window.localStream = fallbackStream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = fallbackStream;
      }
    }

    // Check for screen share availability
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      setScreenAvailable(true);
    } else {
      setScreenAvailable(false);
    }
  };

  useEffect(() => {
    getPermissions();
    
    // Cleanup on unmount
    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      screenShareStreamRef.current?.getTracks().forEach(track => track.stop());
      Object.values(connections).forEach(pc => pc.close());
      socketRef.current?.disconnect();
    };
  }, []);

  const getUserMediaSuccess = (stream) => {
    try {
      // Stop previous stream tracks
      localStreamRef.current?.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.log("Error stopping previous tracks:", error);
    }

    localStreamRef.current = stream;
    window.localStream = stream;
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    // Update all peer connections with new stream
    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      const pc = connections[id];
      const senders = pc.getSenders();

      stream.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track?.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track).catch(console.error);
        } else {
          pc.addTrack(track, stream);
        }
      });
    }
  };

  const getUserMedia = () => {
    if (video || audio) {
      navigator.mediaDevices
        .getUserMedia({ video, audio })
        .then(getUserMediaSuccess)
        .catch((e) => {
          console.error("getUserMedia error:", e);
          // Use black/silence as fallback
          const fallbackStream = blackSilence();
          getUserMediaSuccess(fallbackStream);
        });
    } else {
      // If both video and audio are off, use black/silence stream
      const fallbackStream = blackSilence();
      getUserMediaSuccess(fallbackStream);
    }
  };

  useEffect(() => {
    if (!askForUserName && audio !== undefined && video !== undefined) {
      getUserMedia();
    }
  }, [audio, video, askForUserName]);

  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);
    if (fromId === socketIdRef.current) return;

    if (signal.sdp) {
      connections[fromId]
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            return connections[fromId].createAnswer();
          }
        })
        .then((answer) => {
          if (answer) {
            return connections[fromId].setLocalDescription(answer);
          }
        })
        .then(() => {
          if (connections[fromId].localDescription) {
            socketRef.current.emit(
              "signal",
              fromId,
              JSON.stringify({ sdp: connections[fromId].localDescription })
            );
          }
        })
        .catch((e) => console.error("Error handling SDP:", e));
    }

    if (signal.ice) {
      connections[fromId]
        .addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch((e) => console.error("Error adding ICE candidate:", e));
    }
  };

  const addMessage = (data) => {
    setMessages((prevMessages) => [...prevMessages, data]);
    setNewMessages((prev) => prev + 1);
  };

  const connectToSocketServer = () => {
    socketRef.current = io(server_url, { secure: false });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        if (connections[id]) {
          connections[id].close();
          delete connections[id];
        }
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          if (!connections[socketListId]) {
            connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
            
            connections[socketListId].onicecandidate = (event) => {
              if (event.candidate != null) {
                socketRef.current.emit(
                  "signal",
                  socketListId,
                  JSON.stringify({ ice: event.candidate })
                );
              }
            };

            connections[socketListId].ontrack = (event) => {
              const [remoteStream] = event.streams;
              
              setVideos((prevVideos) => {
                const exists = prevVideos.find(v => v.socketId === socketListId);
                if (exists) {
                  return prevVideos.map(video =>
                    video.socketId === socketListId
                      ? { ...video, stream: remoteStream }
                      : video
                  );
                } else {
                  return [...prevVideos, {
                    socketId: socketListId,
                    stream: remoteStream,
                    autoPlay: true,
                    playsInline: true,
                  }];
                }
              });
            };

            // Add local tracks to the connection
            const stream = localStreamRef.current || window.localStream || blackSilence();
            stream.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, stream);
            });
          }
        });

        // Create offers for existing connections
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            connections[id2].createOffer()
              .then((offer) => connections[id2].setLocalDescription(offer))
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id2,
                  JSON.stringify({ sdp: connections[id2].localDescription })
                );
              })
              .catch(console.error);
          }
        }
      });

      socketRef.current.on("signal", gotMessageFromServer);
    });
  };

  const getMedia = () => {
    if (!userName.trim()) {
      alert("Please enter a username");
      return;
    }
    
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    setAskForUserName(false);
    connectToSocketServer();
  };

  const handleVideo = async () => {
    try {
      if (video) {
        // Turn video OFF
        const videoTrack = localStreamRef.current?.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = false;
        }
        setVideo(false);
      } else {
        // Turn video ON
        let videoTrack = localStreamRef.current?.getVideoTracks()[0];
        
        if (!videoTrack || videoTrack.readyState === "ended") {
          // Need to get new video track
          try {
            const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const newVideoTrack = newStream.getVideoTracks()[0];
            
            // Remove old video track if exists
            if (videoTrack) {
              localStreamRef.current.removeTrack(videoTrack);
              videoTrack.stop();
            }
            
            // Add new video track
            localStreamRef.current.addTrack(newVideoTrack);
            
            // Update peer connections
            for (let id in connections) {
              if (id === socketIdRef.current) continue;
              
              const sender = connections[id].getSenders().find(s => s.track?.kind === "video");
              if (sender) {
                await sender.replaceTrack(newVideoTrack);
              } else {
                connections[id].addTrack(newVideoTrack, localStreamRef.current);
              }
            }
            
            videoTrack = newVideoTrack;
          } catch (err) {
            console.error("Error getting video:", err);
            return;
          }
        }
        
        videoTrack.enabled = true;
        setVideo(true);
      }
      
      // Update local video preview
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    } catch (err) {
      console.error("Error in handleVideo:", err);
    }
  };

  const handleAudio = async () => {
    try {
      if (audio) {
        // Turn audio OFF
        const audioTrack = localStreamRef.current?.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = false;
        }
        setAudio(false);
      } else {
        // Turn audio ON
        let audioTrack = localStreamRef.current?.getAudioTracks()[0];
        
        if (!audioTrack || audioTrack.readyState === "ended") {
          // Need to get new audio track
          try {
            const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const newAudioTrack = newStream.getAudioTracks()[0];
            
            // Remove old audio track if exists
            if (audioTrack) {
              localStreamRef.current.removeTrack(audioTrack);
              audioTrack.stop();
            }
            
            // Add new audio track
            localStreamRef.current.addTrack(newAudioTrack);
            
            // Update peer connections
            for (let id in connections) {
              if (id === socketIdRef.current) continue;
              
              const sender = connections[id].getSenders().find(s => s.track?.kind === "audio");
              if (sender) {
                await sender.replaceTrack(newAudioTrack);
              } else {
                connections[id].addTrack(newAudioTrack, localStreamRef.current);
              }
            }
            
            audioTrack = newAudioTrack;
          } catch (err) {
            console.error("Error getting audio:", err);
            return;
          }
        }
        
        audioTrack.enabled = true;
        setAudio(true);
      }
    } catch (err) {
      console.error("Error in handleAudio:", err);
    }
  };

  const handleScreen = async () => {
    if (!screen) {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        
        screenShareStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];
        
        // Replace video track in all connections
        for (let id in connections) {
          if (id === socketIdRef.current) continue;
          
          const sender = connections[id].getSenders().find(s => s.track?.kind === "video");
          if (sender) {
            await sender.replaceTrack(screenTrack);
          }
        }
        
        // Update local preview
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        // Handle screen share ending
        screenTrack.onended = () => {
          stopScreenShare();
        };
        
        setScreen(true);
      } catch (err) {
        console.error("Error starting screen share:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    if (screenShareStreamRef.current) {
      screenShareStreamRef.current.getTracks().forEach(track => track.stop());
      screenShareStreamRef.current = null;
    }
    
    // Restore camera video
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      for (let id in connections) {
        if (id === socketIdRef.current) continue;
        
        const sender = connections[id].getSenders().find(s => s.track?.kind === "video");
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }
      
      // Update local preview
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }
    
    setScreen(false);
  };

  const disconnect = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    screenShareStreamRef.current?.getTracks().forEach(track => track.stop());
    Object.values(connections).forEach(pc => pc.close());
    socketRef.current?.disconnect();
    setAskForUserName(true);
    setVideos([]);
  };

  return (
    <div>
      {askForUserName === true ? (
        <div>
          <h2>Enter into Lobby</h2>
          <TextField
            id="outlined-basic"
            label="Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            variant="outlined"
          />
          <Button variant="contained" onClick={getMedia}>
            Connect
          </Button>

          <div>
            <video ref={localVideoRef} autoPlay muted></video>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          <div className={styles.buttonContainer}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={disconnect} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            {screenAvailable === true ? (
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen === true ? <StopScreenShareIcon /> : <ScreenShareIcon />}
              </IconButton>
            ) : (
              <></>
            )}
            <Badge badgeContent={newMessages} max={999} color="secondary">
              <IconButton style={{ color: "white" }}>
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>
          <video
            className={styles.meetUserVideo}
            ref={localVideoRef}
            autoPlay
            muted
          ></video>
          <div className={styles.conferenceView}>
            {videos.map((video) => (
              <div key={video.socketId}>
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                  playsInline
                ></video>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoMeetComponent;