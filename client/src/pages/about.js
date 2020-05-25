// core
import React, { useEffect } from "react";
import _ from "lodash";

import analytics from "../analytics";

import ProfileImage from "../images/profile.png";

import "../styles/about.css";

export default function Home() {
  const onClickAinizeLink = () => {
    analytics.event({
      category: 'spotainize_common',
      action: 'poweredby_click',
    });
  }
  const onClickGithubLink = () => {
    analytics.event({
      category: 'spotainize_common',
      action: 'github_click',
    });
  }
  useEffect(() => {
    analytics.ga("send", "pageview", "/about");
  }, []);
  return (
    <main>
      <div className="about_hero section">
        <div className="container">
          <div className="content">
            <h1>
              Join us to improve <br />
              Crowdy
            </h1>
            <h4>
              Hundreds of open-source projects or hackathon winning ideas with
              great potential end up being forgotten in Github repositories. We
              found Crowdy, a hackathon-winning project that has great potential
              to help people globally. Powered by Ainize, we published the next
              version of Crowdy with new features -- but there’s still plenty of
              room for improvement.
            </h4>
          </div>
          <div className="content quote">
            <h3>
              “To have another team, from another part of the world, build new
              features for Crowdy is something really heartwarming to see."
            </h3>
            <h4>Andrew Lim, Author of Crowdy</h4>
            <img src={ProfileImage} />
          </div>
        </div>
      </div>
      <div className="about section">
        <div className="container">
          <div className="content">
            <h2>How to join</h2>
            <h4>
              Create a branch and send pull requests to this {" "}
              <a target="_blank"  onClick={onClickGithubLink} href="https://github.com/ainize-team2/crowdy">
                Github repo
              </a>{" "}
              to make Crowdy better, or simply use our{" "}
              <a href="https://www.ainize.ai/liayoo/crowdy" onClick={onClickAinizeLink} target="_blank">
                location APIs
              </a>{" "}
               in other interesting projects!
            </h4>
          </div>
        </div>
        <div className="container">
          <div className="content">
            <h2>What is Crowdy?</h2>
            <h4>
              Crowdy displays the LIVE status of nearby supermarkets, hospitals,
              pharmacies, banks, and restaurants based on your current location
              to help people avoid crowded places, minimizing COVID19 risks. The
              project was initially developed by Andrew Lim, submitted to
              COVID-19 Global Hackathon 1.0.
            </h4>
            <h4>
              <a
                target="_blank"
                href="https://devpost.com/software/crowdy-8w1pvu"
              >
                Find more information about the original version of Crowdy
              </a>
            </h4>
          </div>
        </div>
      </div>
      <div className="ainize section">
        <div className="container">
          <div className="content">
            <h2>What is Ainize</h2>
            <h4>
              Ainize is a serverless cloud platform that helps developers to
              transform open-source projects into live services. To encourage
              the creation of innovative projects, deploying public Github
              repositories is free at Ainize. If your repo has a Dockerfile,
              you're just one click away from free deployments!
            </h4>
            <a target="_blank" href="https://ainize.ai">
              <button onClick={onClickAinizeLink}>Visit Ainize Website</button>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
