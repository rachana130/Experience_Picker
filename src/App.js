import React, { useContext, useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Home from "./Pages/Home/home";
import About from "./Pages/About/about";
import Find from "./Pages/Find/find";
import SurpiseMe from "./Pages/SurpriseMe/surprise";
import Recommended from "./Pages/Recommended/recommended";
import Context from "./Store/context";
import Geocode from "react-geocode";
import { ApolloProvider } from "react-apollo";
import ApolloClient from "apollo-boost";

const client = new ApolloClient({
  uri: `${"https://cors-anywhere.herokuapp.com/"}https://api.yelp.com/v3/graphql`,
  request: operation => {
    operation.setContext({
      headers: {
        authorization: process.env.REACT_APP_YELP_KEY,
        "Accept-Language": "en-US"
      }
    });
  }
});

const App = props => {
  const { state, actions } = useContext(Context);

  Geocode.setApiKey(process.env.REACT_APP_GOOGLE_KEY);
  Geocode.setLanguage("en");

  let lat = "-1";
  let long = "-1";
  let address = "";
  let val_status = "";

  function getLocation(callback) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(position) {
          lat = position.coords.latitude;
          long = position.coords.longitude;

          // Get address from latidude & longitude.
          Geocode.fromLatLng(lat, long).then(
            response => {
              address = response.results[0].formatted_address;
              val_status = "success";
              callback();
            },
            error => {
              address = "please enter address, unable to get location!";
              val_status = "warning";
              callback();
            }
          );
        },
        function(error) {
          address = "please enter address, unable to get location!";
          val_status = "warning";
          callback();
        }
      );
    } else {
      address = "please enter address, unable to get location!";
      val_status = "warning";
      callback();
    }
  }

  useEffect(() => {
    //get current page
    let curr = window.location.href.split("/").pop();
    if (curr === "") {
      curr = "home";
    }

    getLocation(function() {
      actions({
        type: "setState",
        payload: {
          ...state,
          selected: curr,
          lat: lat,
          long: long,
          address: address,
          val_status: val_status
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/about" exact component={About} />
          <Route path="/find" exact component={Find} />
          <Route path="/recommended" exact component={Recommended} />
          <Route path="/surpriseme" exact component={SurpiseMe} />
          <Route path="/" render={() => <div>404</div>} />
        </Switch>
      </BrowserRouter>
    </ApolloProvider>
  );
};

export default App;
