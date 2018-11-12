import React from 'react';
import './Information.css';

function Information (props) {
  return <div className = "details"><div id = "close">X</div>
          <div className ="venueInfo">
            <h1><sup className="isOpen">&#9679;</sup>{props.name}</h1>
            <div className = "categories">(
            {props.categories.map((category) => {
              return <span className = "category" key={category}>{category},</span>
            })}
            )</div>
            <p>{props.address}</p>
            <p><a href={props.phone}>{props.phone}</a></p><br />
            <div className = "attributes">
            {props.attributes.map((attribute) => {
              return <span className = "attribute" key={attribute}>{attribute}</span>
            })}
            </div>
            <div className = "bestPhoto">
            {props.photos.map((photo) => {
              return <img className = "venueImage" alt="" key={photo} src={photo} />
            })}
            </div>
          </div>
         </div>
}

export default Information;
