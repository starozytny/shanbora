import '../css/default.scss';
import toastr from 'toastr';

const routes = require('@publicFolder/js/fos_js_routes.json');
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Default} from '@reactFolder/composants/default/Default';
import {Settings} from './pages/composants/settings/Settings';

Routing.setRoutingData(routes);

let def = document.getElementById("default");
if(def){
    ReactDOM.render(
        <Default title={def.dataset.title} menu={def.dataset.menu} menuBottom={def.dataset.menuBottom} username={def.dataset.username} avatar={def.dataset.avatar} />, def
    )
}

let settings = document.getElementById("settings-dashboard");
if(settings){
    ReactDOM.render(
        <Settings isDanger={1}/>, settings
    )
}

toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }