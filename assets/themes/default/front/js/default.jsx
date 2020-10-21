import '../css/default.scss';
import React, {Components} from 'react';
import ReactDOM from 'react-dom';
// import {BulleCookies} from './components/composants/Cookies';
const routes = require('../../../../../public/js/fos_js_routes.json');
import Routing from '../../../../../public/bundles/fosjsrouting/js/router.min.js';
import {Default} from './components/composants/default/Default';
import {Footer} from './components/composants/default/Footer';

Routing.setRoutingData(routes);

// cookies(); 

// function cookies(){
//     let cookies = document.getElementById('param-cookies-container');
//     ReactDOM.render(
//         <BulleCookies urlPolitique={Routing.generate('app_politique')} urlGestion={Routing.generate('app_cookies')}/>,
//         cookies
//     );
// }

let def = document.getElementById("default");
if(def){
    ReactDOM.render(
        <Default menu={def.dataset.menu} />, def
    )
}

let footer = document.getElementById("footer");
if(footer){
    ReactDOM.render(
        <Footer />, footer
    )
}