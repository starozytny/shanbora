import '../../css/pages/rgpd.scss';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Rgpd} from './composants/rgpd/Rgpd';
import {Newsletter} from './composants/newsletter/Newsletter';

let el = document.getElementById("rgpd");
if(el){
    ReactDOM.render(
        <Rgpd demandes={el.dataset.demandes} />,
        el
    )
}

let elN = document.getElementById("newsletter");
if(elN){
    ReactDOM.render(
        <Newsletter demandes={elN.dataset.demandes} />,
        elN
    )
}