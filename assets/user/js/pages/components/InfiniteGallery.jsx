import React, { useRef, useState, useEffect, Component } from 'react';

import axios from "axios";
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

import Formulaire from "@commonFunctions/formulaire";
import ModalFunctions from '@commonFunctions/modal';

import { ButtonA } from "@tailwindComponents/Elements/Button";
import { LightBox } from "@tailwindComponents/Elements/LightBox";
import { createPortal } from "react-dom";

const URL_GET_DATA = "intern_api_user_gallery_fetch_images";
const URL_READ_IMAGE = "intern_api_user_gallery_read_image";
const URL_READ_IMAGE_HD = "intern_api_user_gallery_read_image_hd";
const URL_DOWNLOAD_FILE = "intern_api_user_gallery_download";
const URL_DOWNLOAD_ARCHIVE = "intern_api_user_gallery_archive";

const InfiniteGallery = () => {
	const refLightbox = useRef(null);
	const [images, setImages] = useState([]); // Stocke les images
	const [loading, setLoading] = useState(false); // Indique si un chargement est en cours

	useEffect(() => {
		// Fonction pour récupérer les images
		const fetchImages = async () => {
			if (loading) return; // Ne pas charger si déjà en cours ou s'il n'y a plus d'images
			setLoading(true);

			axios({ method: "GET", url: Routing.generate(URL_GET_DATA), data: {} })
				.then(function (response) {
					setImages(prevImages => [...prevImages, ...response.data]); // Ajoute les nouvelles images à celles déjà chargées
				})
				.catch(function (error) {
					Formulaire.displayErrors(null, error);
				})
				.then(function () {
					setLoading(false);
				})
			;
		};

		fetchImages(); // Charge les images lors de chaque changement de page
	}, []);

	let handleLightbox = (elem) => {
		refLightbox.current.handleUpdateContent(<LightboxContent identifiant="lightbox" images={images} elem={elem} />);
		refLightbox.current.handleClick();
	}

	return (
		<div>
			<div className="mb-12 flex items-center justify-center">
				<ButtonA type="blue" onClick={Routing.generate(URL_DOWNLOAD_ARCHIVE)}>
					Télécharger toutes les photos
				</ButtonA>
			</div>
			<div className="flex flex-col gap-4 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 pswp-gallery" id="gallery">
				{images.map(image => (
					<div key={image.id} className="block gallery-item bg-white"
					   // href={Routing.generate(URL_DOWNLOAD_FILE, { id: image.id })}
						onClick={() => handleLightbox(image)}
					>
						<img src={Routing.generate(URL_READ_IMAGE, { id: image.id })} alt={`Photo ${image.originalName}`} loading="lazy"/>
					</div>
				))}
			</div>

			{loading && <div className="text-center text-gray-600 text-sm mt-4">Chargement...</div>}

			{createPortal(<LightBox ref={refLightbox} identifiant="lightbox" content={null}  />
				, document.body
			)}
		</div>
	);
};

export class LightboxContent extends Component {
	handleCloseModal = (e) => {
		e.preventDefault();

		const { identifiant } = this.props;

		let [body, modal, modalContent, btns] = ModalFunctions.getElements(identifiant);

		ModalFunctions.closeM(body, modal, modalContent);
	}

	render () {
		const { images, elem } = this.props;

		return <>
			<div className="fixed top-0 left-0 w-full flex justify-between p-4 text-white z-20">
				<div>{images.length} photos</div>
				<div>
					<div className="close-modal cursor-pointer hover:text-red-500" onClick={this.handleCloseModal}>
						<span className="icon-close !text-2xl" />
					</div>
				</div>
			</div>
			<div className="flex justify-center items-center h-full">
				{images.map(image => (
					<div key={image.id} className={`${elem.id === image.id ? "block" : "hidden"} w-full h-full`}
						// href={Routing.generate(URL_DOWNLOAD_FILE, { id: image.id })}
					>
						<img src={Routing.generate(URL_READ_IMAGE_HD, { id: elem.id })} alt={`Photo ${elem.originalName}`} className="w-full h-full object-contain" loading="lazy" />
					</div>
				))}
			</div>
		</>
	}
}

export default InfiniteGallery;
