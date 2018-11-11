import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import Information from './Information';
import {FOURSQUARE, GOOGLE} from './Config';
let pos, infowindow, userInfoWindow, userMarker, locName, locAddress, currentLocation, bestPhoto;

class App extends Component {
  state = {
    pos: {},
    venues: [],
    currentLocation: currentLocation
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
          let newPos = {lat: x, lng: y}
          this.setState({pos:newPos});
          this.showUserLocation(map, newPos);
        });
  }
  //render Google map
  renderMap = () => {
    console.log("RENDERING MAP");
    loadScript("https://maps.googleapis.com/maps/api/js?key="+GOOGLE.key);
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
      client_id: FOURSQUARE.client_id,
      client_secret: FOURSQUARE.client_secret,
      query: "drinks",
      ll: this.state.pos.lat+","+this.state.pos.lng,
      v: "20182507"
    };
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
      let locationName = myVenue.venue.name;
      let locationAddress =  myVenue.venue.location.address;
      let venueId = myVenue.venue.id;
      let contentString = `${myVenue.venue.name}<br>
                           ${myVenue.venue.location.address}<br>
                           ${myVenue.venue.location.city}<br>
                      <img src="${myVenue.venue.categories[0].icon.prefix}64${myVenue.venue.categories[0].icon.suffix}">`;

      let marker = new window.google.maps.Marker({
      position: {lat: myVenue.venue.location.lat, lng: myVenue.venue.location.lng},
        map: map,
        icon: 'https://boozefinder.herokuapp.com/images/beer32.png?raw=true',
        title: myVenue.venue.name
      });
      //call InfoWindow outside of loop so only displays one at a time
      infowindow = new window.google.maps.InfoWindow;
      marker.addListener('click', (e) => {
        console.log(venueId);
        this.setState({currentLocation: locationName});
        locAddress = locationAddress;
        let details = document.querySelector(".details");
        let _map = document.getElementById("map");
        if ((locName != this.state.currentLocation) || (!details.classList.contains("details--active"))){
          if (locName != this.state.currentLocation){
            this.getVenueInformation(venueId, myVenue);
          }
          console.log("OPEN OR KEEP OPEN");
          details.classList.add("details--active");
          _map.style.height = "70vh";
          map.setZoom(15.5);
          let close = document.querySelector("#close");
          close.addEventListener("click", (e) => {
            details.classList.remove("details--active");
            map.setZoom(16);
            console.log("closing");
            _map.style.height= "100vh";
          })
        }
        else {
            details.classList.remove("details--active");
            map.setZoom(16);
            console.log("closing");
            _map.style.height= "100vh";
        }
        locName = locationName;
      });
    })
    this.watchCurrentPosition(map);
  }
  //display infowindow for user location
  showUserLocation = (map, newPos) => {
    newPos = newPos || pos;
    if (userMarker == null){
      userMarker = new window.google.maps.Marker({
        position: {lat: this.state.pos.lat, lng: this.state.pos.lng},
        map: map,
        icon: 'https://boozefinder.herokuapp.com/images/user.png?raw=true',
      });
    } else {
      userMarker.setPosition(newPos);
      userMarker.addListener ("click", (e) => {
        this.getVenues();
      })
    }
  }
  //get individual Venue information (detailed)
  getVenueInformation = (venueId, myVenue) => {
    let params = {
      client_id: FOURSQUARE.client_id,
      client_secret: FOURSQUARE.client_secret,
      ll: myVenue.venue.location.lat+","+myVenue.venue.location.lng,
      v: "20182507"
    };
    const endPoint2 = "https://api.foursquare.com/v2/venues/"+venueId+"?";
    axios.get(endPoint2 + new URLSearchParams(params))
      .then(response => {
        console.log(response.data.response.venue);
        console.log("best photo", response.data.response.venue.bestPhoto.prefix+100+response.data.response.venue.bestPhoto.suffix);
        bestPhoto = response.data.response.venue.bestPhoto.prefix+100+response.data.response.venue.bestPhoto.suffix;
        console.log("categories", response.data.response.venue.categories[0].name);
        let isOpen = document.querySelector(".isOpen");
        if (response.data.response.venue.hours){
          console.log("is it open", response.data.response.venue.hours.isOpen);
          isOpen.style.color = "green";
        } else if (response.data.response.venue.hours == undefined){
          isOpen.style.color = "yellow";
        }
        else{
          isOpen.style.color = "red";
        }
        console.log("has food menu", response.data.response.venue.hasMenu);
        console.log("Venue photos", response.data.response.venue.photos.groups[1].count);
        console.log("description", response.data.response.venue.description);
        console.log("phone", response.data.response.venue.contact.phone);
      })
      .catch(error => {
        console.log("ERROR: " + error);
      })
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
        <Information name={locName} address={locAddress} bestPhoto = {bestPhoto}/>
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
