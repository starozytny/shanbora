import React from "react";
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

import axios from "axios";

import { createRoot } from "react-dom/client";
import { CommentaryFormulaire } from "@appFolder/pages/components/Blog/Commentary/CommentaryForm";
import { CommentaryDelete } from "@appFolder/pages/components/Blog/Commentary/CommentaryDelete";
import { CommentaryResponse } from "@appFolder/pages/components/Blog/Commentary/CommentaryResponse";

const URL_CREATE_STAT = "intern_api_blog_stats_create";

let el = document.getElementById("commentary_create");
if(el){
    createRoot(el).render(<CommentaryFormulaire {...el.dataset} />)
}

let stats = document.getElementById("adventures_stats");
if(stats){
    window.addEventListener('load', () => {
        setTimeout(() => {
            axios({ method: "POST", url: Routing.generate(URL_CREATE_STAT), data: {adventureId: stats.dataset.adventureId} })
                .then(function (response) {})
            ;
        }, 3000)
    });
}

let deletes = document.querySelectorAll(".commentary_delete");
if(deletes){
    deletes.forEach(item => {
        createRoot(item).render(<CommentaryDelete {...item.dataset} />)
    })
}

let responses = document.querySelectorAll(".commentary_response");
if(responses){
    responses.forEach(item => {
        createRoot(item).render(<CommentaryResponse {...item.dataset} />)
    })
}
