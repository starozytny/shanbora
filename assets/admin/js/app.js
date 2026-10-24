import '../css/app.scss';

const routes = require('@publicFolder/js/fos_js_routes.json');
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min';

import axios from "axios";
import React from 'react';
import { createRoot } from "react-dom/client";

// Marks every axios request as AJAX-originated: the backend requires this
// header on authenticated write requests as a lightweight CSRF defense.
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import Menu from "@tailwindFunctions/menu";

import { Notifications } from "@tailwindComponents/Modules/Notifications/Notifications";

Routing.setRoutingData(routes);

Menu.menuListener();

const notifications = document.getElementById("notifications");
if(notifications){
    createRoot(notifications).render(<Notifications {...notifications.dataset} />)
}


