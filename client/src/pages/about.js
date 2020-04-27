// core
import React, { useEffect } from "react";
import _ from "lodash";

import analytics from "../analytics";

export default function Home() {
  useEffect(() => {
    analytics.ga("send", "pageview", "/about");
  });
  return (
    <main>
      <div className="about section">
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
              Find more information about the original version of Crowdy:{" "}
              <a>https://devpost.com/software/crowdy-8w1pvu</a>
            </h4>
          </div>
          <div className="content">
            <h2>Crowdy x Ainize</h2>
            <h4>
              Ainize team’s vision is to transform millions of open source code
              into a scalable API service. Once you deploy your favorite
              open-source project, it'll be served for everyone — a simple way
              to contribute to the open-source community! Ainize is free as long
              as you deploy an open-source!
            </h4>
            <h4>
              Ainize Website: <a>https://ainize.ai </a>
            </h4>
          </div>
        </div>
      </div>
    </main>
  );
}
