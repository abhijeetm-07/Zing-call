import './App.css'
import {Route,BrowserRouter as Router,Routes} from "react-router-dom";
import LandingPage from './pages/LandingPage.jsx';
import Authentication from './pages/Authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/VideoMeet.jsx';
import HomeComponent from './pages/Home.jsx';
function App() {
  
  return (
   <>
    <Router>
    <AuthProvider>
      <Routes>
        <Route path="/home" element={< HomeComponent/>}/>
        <Route path="/" element={<LandingPage />}/>
        <Route path="/auth" element={<Authentication />}/>
        <Route path="/:url" element={<VideoMeetComponent />}/>
      </Routes>
      </AuthProvider>
    </Router>
   </>
  )
}

export default App
