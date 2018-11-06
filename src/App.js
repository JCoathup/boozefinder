import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
let pos, infowindow, userInfoWindow, userMarker;

class App extends Component {
  state = {
    pos: {},
    venues: []
  }
  //get user location
  getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.setState({pos:pos});
        console.log("RETURNED POSITION: ", pos);
        console.log("STATE IS NOW: ", this.state);
        this.renderMap();
      })
    }
  }
  //track user position
  watchCurrentPosition = (map) => {
    var positionTimer = navigator.geolocation.watchPosition(
        (position) => {
          let x = position.coords.latitude;
          let y = position.coords.longitude;
          console.log("tracking...", position.coords.latitude, position.coords.longitude);
          let newPos = {lat: x, lng: y}
          this.setState({pos:newPos});
          this.showUserLocation(map, newPos);
        });
  }
  //render Google map
  renderMap = () => {
    console.log("RENDERING MAP");
    loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyDVMji-eA1V0Dj7Aa_ShGYIMuQBzosZwLU&callback=initMap");
    window.initMap = this.initMap;
  }
  //initialise map
  initMap = () => {
    const map = new window.google.maps.Map(document.getElementById('map'), {
    center: {lat: pos.lat, lng: pos.lng},
    zoom: 16
    });
    this.getVenues(map);
    this.showUserLocation(map);
  }
  // get venues from Foursquare
  getVenues = (map) => {
    let parameters = {
      client_id: "ORCXZEH2S3AYK2PFCHXOQBVV1DAEJNQLMMTIQMORLPI34KL0",
      client_secret: "Z32R3QF2QLH2K4HJNCYI4ZPKSS5XMDL5CWPHHPG23DFULLA1",
      query: "drinks",
      ll: this.state.pos.lat+","+this.state.pos.lng,
      v: "20182507"
    };
    console.log("getting venues");
    console.log("LOOK HERE: ",this.state);
    const endPoint = "https://api.foursquare.com/v2/venues/explore?";
    axios.get(endPoint + new URLSearchParams(parameters))
      .then(response => {
        this.setState ({
          venues: response.data.response.groups[0].items
        })
        console.log(response);
        this.listVenues(map);
      })
      .catch(error => {
        console.log("ERROR: " + error);
      })
  }
  //show venues from Foursquare on map
  listVenues = (map) => {
    this.state.venues.map(myVenue => {
      console.log("listing venues");
      let contentString = `${myVenue.venue.name}<br>
                           ${myVenue.venue.location.address}<br>
                           ${myVenue.venue.location.city}<br>
                      <img src="${myVenue.venue.categories[0].icon.prefix}64${myVenue.venue.categories[0].icon.suffix}">`;

      //let iconBase = '/beer.png';
      let marker = new window.google.maps.Marker({
        position: {lat: myVenue.venue.location.lat, lng: myVenue.venue.location.lng},
        map: map,
        icon: 'https://boozefinder.herokuapp.com/images/beer32.png?raw=true',
        title: myVenue.venue.name
      });
      //call InfoWindow outside of loop so only displays one at a time
      infowindow = new window.google.maps.InfoWindow;
      marker.addListener('click', function() {
        infowindow.setContent(contentString);
        infowindow.open(map, marker);
      });
    })
    this.watchCurrentPosition(map);
  }
  //display infowindow for user location
  showUserLocation = (map, newPos) => {
    newPos = newPos || pos;
    userMarker = null;
    userMarker = new window.google.maps.Marker({
      position: {lat: this.state.pos.lat, lng: this.state.pos.lng},
      map: map,
      icon: 'https://boozefinder.herokuapp.com/images/user.jpg?raw=true',
    });
    //userInfoWindow = new window.google.maps.InfoWindow;
    //userInfoWindow.setPosition(this.state.pos);
    //userInfoWindow.setContent('Location found.');
    //userInfoWindow.open(map);
    //map.setCenter(this.state.pos);
  }
  //ReactJS lifecycle hook
  componentDidMount = () => {
    this.getLocation();
  }
  render() {
    return (
      <div className="App">
        <main>
          <div id="map"></div>
        </main>
      </div>
    );
  }
}

//enables us to call google script from within ReactJS
function loadScript (url){
  var index = window.document.getElementsByTagName("script")[0];
  var script = window.document.createElement("script");
  script.src = url;
  script.async = true;
  script.defer = true;
  index.parentNode.insertBefore(script, index);
}

export default App;
