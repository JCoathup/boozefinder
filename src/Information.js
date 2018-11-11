import React, { Component } from 'react';
import './Information.css';

function Information (props) {
  return <div className = "details">
          <div className ="venueInfo">
            <li className="isOpen"></li>
            <h1>{props.name}</h1>
            <p>{props.address}</p>
            <div className = "bestPhoto"><img src={props.bestPhoto} /></div>
            <div id = "close">X</div>
          </div>
         </div>
}

export default Information;
