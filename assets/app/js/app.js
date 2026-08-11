import '../css/app.scss';
import 'aos/dist/aos.css';

const routes = require('@publicFolder/js/fos_js_routes.json');
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min';

import axios from "axios";
import React from "react";
import { createRoot } from "react-dom/client";

// Marks every axios request as AJAX-originated: the backend requires this
// header on authenticated write requests as a lightweight CSRF defense.
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import AOS from "aos/dist/aos";
import Menu from "@tailwindFunctions/menu";
import Toastr from "@tailwindFunctions/toastr";

import { ContactFormulaire } from "@appFolder/pages/components/Contact/ContactForm";
import { Cookies, CookiesGlobalResponse } from "@tailwindComponents/Modules/Cookies/Cookies";

Routing.setRoutingData(routes);

AOS.init();

Menu.menuListener();
Toastr.flashes();
inputPassword();

let el = document.getElementById("contacts_create");
if(el){
    createRoot(el).render(<ContactFormulaire />)
}

let ck = document.getElementById("cookies");
if(ck){
    createRoot(ck).render(<Cookies {...ck.dataset} />)
}

let cookiesGlobalResponse = document.getElementById("cookies-global-response");
if (cookiesGlobalResponse) {
    createRoot(cookiesGlobalResponse).render(<CookiesGlobalResponse {...cookiesGlobalResponse.dataset} />)
}

function inputPassword () {
    let inputShow = document.querySelector('.input-show');
    if(inputShow){
        let see = false;
        let input = document.querySelector('#password');
        let icon = document.querySelector('.input-show > span');
        inputShow.addEventListener('click', function (e){
            if(see){
                see = false;
                input.type = "password";
                icon.classList.remove("icon-vision-not");
                icon.classList.add("icon-vision");
            }else{
                see = true;
                input.type = "text";
                icon.classList.add("icon-vision-not");
                icon.classList.remove("icon-vision");
            }
        })
    }
}

let totop = document.querySelector('.to-top');
if(totop){
    totop.addEventListener('click', () => {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    })
}
