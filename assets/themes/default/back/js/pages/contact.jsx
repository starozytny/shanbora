import React, {Component} from 'react';
import ReactDOM           from 'react-dom';
import {Contact}          from './composants/contact/Contact';

let el = document.getElementById("contact");
if(el){
    ReactDOM.render(
        <Contact demandes={el.dataset.demandes} />,
        el
    )
}