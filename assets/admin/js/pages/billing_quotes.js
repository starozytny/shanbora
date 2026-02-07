import "../../css/pages/billing_quotes.scss"

import React from "react";
import { createRoot } from "react-dom/client";
import { QuotesList } from "@adminPages/Quotes/QuotesList";

let el = document.getElementById("billing_quotes_list");
console.log(el);
if(el){
    createRoot(el).render(<QuotesList {...el.dataset} />)
}
