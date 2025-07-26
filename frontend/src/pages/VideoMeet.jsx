import React, { useEffect, useRef, useState } from 'react'
import "../styles/videoComponent.css"
import { TextField,Button} from "@mui/material";


const server_url="http://localhost:8000";
var connections={}
const peerConfigConnections={
  "iceServers":[{
    "url":"stun:stun.l.google.com:19302",
  }]
}

function VideoMeetComponent() {

  var socketRef=useRef();
  let socketIdRef=useRef();

  let localVideoRef = useRef();


  let [videoAvailable,setVideoAvailable]=useState(true)
  let [audioAvailable,setAudioAvailable]=useState(true)
  let [video,setVideo]=useState();
  let [audio,setAudio]=useState();
  let [screen,setScreen]=useState();
  let [showModel,setShowModel]=useState();
  let [screenAvailable,setScreenAvailable]=useState();
  let [messages,setMessages]=useState([]);
  let [message,setMessage]=useState("");
  let [newMessages,setNewMessages]=useState(0);
  let [askForUserName,setAskForUserName]=useState(true);
  let [userName,setUserName]=useState("");

  const videoRef=useRef([]);
  let [videos,setVideos]=useState([]);

  // TODO-REMAINDER
  //if(isChrome===false){}

const getPermissons = async () => {
  try {
    const videoPermisson = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoPermisson) {
      setVideoAvailable(true);
    } else {
      setVideoAvailable(false);
    }

    const audioPermisson = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (audioPermisson) {
      setAudioAvailable(true);
    } else {
      setAudioAvailable(false);
    }

    if (navigator.mediaDevices.getDisplayMedia) {
      setScreenAvailable(true);
    } else {
      setScreenAvailable(false);
    }

    let userMediaStream;
    if (videoAvailable || audioAvailable) {
      userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoAvailable,
        audio: audioAvailable,
      });
    }

    if (userMediaStream) {
      window.localStream = userMediaStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = userMediaStream;
      }
    }
  } catch (error) {
    console.error("Permission error:", error);
  }
};


  useEffect(()=>{
    getPermissons();
  },[])


  let getUserMediaSuccess=(stream)=>{

  }

  let getUserMedia=()=>{
    if((video||videoAvailable) || ( audio||audioAvailable)){
      navigator.mediaDevices.getUserMedia({video:video,audio:audio})
      .then(()=>{})//TODO GETUSERMEDIA SUCCESS
      .then((stream)=>{ })
      .catch((e)=>{console.log(e);
      })
    }else{
      try {
        let tracks=localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (error) {
        console.log(error);
        
      }
    }
  }

  useEffect(()=>{
    if(audio!==undefined && video!==undefined){
      getUserMedia();
    }

  },[audio,video])

  let getMedia=()=>{
    setVideo(videoAvailable)
    setAudio(audioAvailable)
    // connctToSocketServer()
  }

  return (

    <div>
      {askForUserName===true?<div>
        <h2>Enter into Lobby</h2>
        <TextField id="outlined-basic" label="Username" value={userName} onChange={e=>setUserName(e.target.value)} variant="outlined" />
          <Button variant="contained" >Connect</Button>

          <div>
            <video ref={localVideoRef} autoPlay muted></video>
          </div>
        </div>
        
        :<></>}
    </div>
  )
}

export default VideoMeetComponent
