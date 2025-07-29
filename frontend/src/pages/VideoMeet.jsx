import React, { useEffect, useRef, useState } from "react";
import "../styles/videoComponent.css";
import { TextField, Button } from "@mui/material";
import { io } from "socket.io-client";

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

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState([]);
  const [audio, setAudio] = useState([]);
  const [screen, setScreen] = useState();
  const [showModel, setShowModel] = useState();
  const [screenAvailable, setScreenAvailable] = useState();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [askForUserName, setAskForUserName] = useState(true);
  const [userName, setUserName] = useState("");
  const [videos, setVideos] = useState([]);

  const videoRef = useRef([]);

  const getPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (stream) {
        setVideoAvailable(true);
        setAudioAvailable(true);
        window.localStream = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }
    } catch (error) {
      console.error("Permission error:", error);
      setVideoAvailable(false);
      setAudioAvailable(false);
    }

    if (navigator.mediaDevices.getDisplayMedia) {
      setScreenAvailable(true);
    } else {
      setScreenAvailable(false);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  const getUserMedia = () => {
    if ((video || videoAvailable) || (audio || audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(() => {})
        .catch((e) => {
          console.log(e);
        });
    } else {
      try {
        const tracks = localVideoRef.current?.srcObject?.getTracks();
        tracks?.forEach((track) => track.stop());
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (audio !== undefined && video !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  const gotMessageFromServer = (fromId, message) => {
    // TODO: Signaling logic
  };

  const addMessage = () => {
    // TODO: Chat logic
  };

  const connectToSocketServer = () => {
    socketRef.current = io(server_url, { secure: false });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
           connections[socketListId].onicecandidate=(event)=>{
            if(event.candidate !=null){
              socketRef.current.emit("signal",socketListId,JSON.stringify({"ice":event.candidate}))
            }
           }

           connections[socketListId].onaddstream=(event)=>{
            let videoExists=videoRef.current.find(video=>video.socketId===socketListId);
            if(videoExists){
              setVideo(videos=>{
                const updateVideos=videos.map(video=>video.socketId===socketListId?{...video,stream:event.stream}:video);
                videoRef.current=updateVideos;
                return updateVideos;
              })
            }else{
              let newVideo={
                socketId:socketListId,
                stream:event.stream,
                autoPlay:true,
                playsinline:true,
              }
              setVideos(videos=>{
                const updateVideos=[...videos,newVideo];
                videoRef.current=updateVideos;
                return updateVideos;
              })
            }
           }

           if(window.localStream!==undefined && window.localStream!==null){
            connections[socketListId].addStream(window.localStream)
           }else{
            // TODO BLACKSILENCE
           }

        });
        if(id===socketIdRef.current){
          for(let id2 in connections){
            if(id2===socketIdRef.current) continue

            try {
              connections[id2].addStream(window.localStream)
            } catch (error) {
              
            }
            connections[id2].createOffer().then((description)=>{
              connections[id2].setLocalDescription(description).then(()=>{
                socketRef.current.emit("signal",id2,JSON.stringify({"sdp":connections[id2].LocalDescription})).catch(e=>console.log(e)
                )

                
              })
            })
          }
        }
      });

      socketRef.current.on("signal", gotMessageFromServer);
    });
  };

  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    setAskForUserName(false);
    connectToSocketServer();
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
      ) 
      : (
        <div>
          <h2>Welcome, {userName}</h2>
          <video ref={localVideoRef} autoPlay muted></video>
        </div>
      )}
    </div>
  );
}

export default VideoMeetComponent;
