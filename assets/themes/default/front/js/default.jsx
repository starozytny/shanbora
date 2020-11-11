import '../css/default.scss';
import React     from 'react';
import ReactDOM  from 'react-dom';

const routes = require('@publicFolder/js/fos_js_routes.json');
import Routing   from '@publicFolder/bundles/fosjsrouting/js/router.min.js';
import {Default} from './components/composants/default/Default';
import {Footer}  from './components/composants/default/Footer';

Routing.setRoutingData(routes);

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