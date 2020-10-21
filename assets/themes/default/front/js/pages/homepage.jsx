import '../../css/pages/homepage.scss';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Newsletter} from './components/homepage/Newsletter';

import AOS from 'aos/dist/aos'

AOS.init();

let el = document.getElementById('newsletter');
if(el){
    ReactDOM.render(<Newsletter />, el)
}

// import Compteur from '../components/composants/Compteur';
//
// experience();
//
// function experience(){
//     let y = new Date();
//     ReactDOM.render(
//         <Compteur max={y.getFullYear() - parseInt(document.querySelector('#r-compteur').dataset.count)}  timer="25"/>,
//         document.getElementById('r-compteur')
//     );
// }