import '../css/app.scss';

const routes = require('@publicFolder/js/fos_js_routes.json');
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min';

import React from "react";
import { createRoot } from "react-dom/client";

import Menu from "@tailwindFunctions/menu";
import Toastr from "@tailwindFunctions/toastr";

import { Cookies, CookiesGlobalResponse } from "@tailwindComponents/Modules/Cookies/Cookies";
import InfiniteGallery from "@userPages/InfiniteGallery";

Routing.setRoutingData(routes);

Menu.menuListener();
Toastr.flashes();

let ck = document.getElementById("cookies");
if(ck){
    createRoot(ck).render(<Cookies {...ck.dataset} />)
}

let cookiesGlobalResponse = document.getElementById("cookies-global-response");
if (cookiesGlobalResponse) {
    createRoot(cookiesGlobalResponse).render(<CookiesGlobalResponse {...cookiesGlobalResponse.dataset} />)
}

let gallery = document.getElementById("gallery_index");
if (gallery) {
    createRoot(gallery).render(<InfiniteGallery />)
}
