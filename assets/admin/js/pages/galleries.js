import React from "react";
import { createRoot } from "react-dom/client";
import InfiniteGallery from "@userPages/InfiniteGallery";

let gallery = document.getElementById("gallery_index");
if (gallery) {
	createRoot(gallery).render(<InfiniteGallery {...gallery.dataset} />)
}
