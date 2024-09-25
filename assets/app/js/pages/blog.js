import React from "react";
import { createRoot } from "react-dom/client";
import { CommentaryFormulaire } from "@appFolder/pages/components/Blog/Commentary/CommentaryForm";

let el = document.getElementById("commentary_create");
if(el){
    createRoot(el).render(<CommentaryFormulaire {...el.dataset} />)
}
