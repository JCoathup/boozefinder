import React, { Component } from 'react';
import './Information.css';

function Information (props) {
  return <div className = "details">
          <h1>{props.name}</h1>
          <h3>{props.city}</h3>
          <p>{props.address}</p>
         </div>
}

export default Information;
