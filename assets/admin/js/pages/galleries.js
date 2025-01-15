import "../../css/pages/galleries.scss"

import React from "react";
import { createRoot } from "react-dom/client";
import InfiniteGallery from "@userPages/InfiniteGallery";
import { AlbumFormulaire } from "@adminPages/Albums/AlbumForm";
import { AlbumDelete } from "@adminPages/Albums/AlbumDelete";

let el = document.getElementById("gallery_index");
if (el) {
	createRoot(el).render(<InfiniteGallery {...el.dataset} />)
}

el = document.getElementById("albums_update");
if (el) {
	createRoot(el).render(<AlbumFormulaire element={JSON.parse(el.dataset.obj)}
										   itemsUsers={JSON.parse(el.dataset.itemsUsers)}
	/>)
}

let deletesAlbum = document.querySelectorAll('.delete-album');
if (deletesAlbum) {
	deletesAlbum.forEach(elem => {
		createRoot(elem).render(<AlbumDelete {...elem.dataset} />)
	})
}
