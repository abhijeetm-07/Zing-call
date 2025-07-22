import React from "react";
import "../App.css";
import { Link } from "react-router";

export default function LandingPage() {
  return (
    <div className="landingPageContainer">
      <nav>
        <div className="navheader">
          <h2>Zing Call</h2>
        </div>
        <div className="navlist">
          <p>Join as Guest</p>
          <p>Register</p>
          <div role="button">
            <p>Login</p>
          </div>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div>
          <h1>
            <span style={{ color: "#ff9839" }}>Connect </span>
            with your loved ones
          </h1>
          <p>Cover distace by Zing Call</p>
          <div role="button">
            <Link to={"/home"}>Get Started </Link>
          </div>
        </div>
        <div>
          <img src="/mobile.png" alt="" />
        </div>
      </div>
    </div>
  );
}
