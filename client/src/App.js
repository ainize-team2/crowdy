// core
import React from "react";
import _ from "lodash";
import Home from "./pages/home";
import About from "./pages/about";
import { Switch, Route, Redirect } from "react-router-dom";

// images
import GitHubIcon from "./images/icon-git-hub.svg";
import AinizeIcon from "./images/icon-ainize.svg";

import "./styles/main.css";

export default function App() {
  return (
    <React.Fragment>
      <header>
        <div className="container">
          <h3 className="logo">Crowdy</h3>
          <div className="menu">
            <a href="/">HOME</a>
            <a href="/about">ABOUT</a>
          </div>
        </div>
      </header>
      <Switch>
        <Route exact path="/about" component={About} />
        <Route exact path="/home" component={Home} />
        <Route path="/">
          <Redirect to="/home" />
        </Route>
      </Switch>
      <footer>
        <a className="ainizeLink" target="_blank" href="https://ainize.ai">
          <img src={AinizeIcon} />
          POWERED BY AINIZE
        </a>
        <a className="githubLink" target="_blank" href="https://github.com/ainize-team2/crowdy">
          <img src={GitHubIcon} />
          VISIT GITHUB
        </a>
      </footer>
    </React.Fragment>
  );
}
