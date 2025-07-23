import './App.css'
import {Route,BrowserRouter as Router,Routes} from "react-router-dom";
import LandingPage from './pages/landingPage';
import Authentication from './pages/Authentication';
function App() {
  
  return (
   <>
    <Router>

      <Routes>
        {/* <Route path="home" element="/"/> */}
        <Route path="/" element={<LandingPage />}/>
        <Route path="/auth" element={<Authentication />}/>
      </Routes>
    </Router>
   </>
  )
}

export default App
