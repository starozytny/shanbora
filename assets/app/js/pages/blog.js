import React from "react";
import { createRoot } from "react-dom/client";
import { CommentaryFormulaire } from "@appFolder/pages/components/Blog/Commentary/CommentaryForm";
import { CommentaryDelete } from "@appFolder/pages/components/Blog/Commentary/CommentaryDelete";
import { CommentaryResponse } from "@appFolder/pages/components/Blog/Commentary/CommentaryResponse";

let el = document.getElementById("commentary_create");
if(el){
    createRoot(el).render(<CommentaryFormulaire {...el.dataset} />)
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
