import React, { useState, useEffect } from 'react';

import axios from "axios";
import debounce from 'lodash.debounce';
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

import Formulaire from "@commonFunctions/formulaire";

import { ButtonA } from "@tailwindComponents/Elements/Button";

const URL_GET_DATA = "intern_api_user_gallery_fetch_images";
const URL_READ_IMAGE = "intern_api_user_gallery_read_image";
const URL_DOWNLOAD_FILE = "intern_api_user_gallery_download";
const URL_DOWNLOAD_ARCHIVE = "intern_api_user_gallery_archive";

const InfiniteGallery = () => {
	const [images, setImages] = useState([]); // Stocke les images
	const [page, setPage] = useState(1);      // Page courante
	const [hasMore, setHasMore] = useState(true); // Indique s'il reste des images à charger
	const [loading, setLoading] = useState(false); // Indique si un chargement est en cours

	useEffect(() => {
		// Fonction pour récupérer les images
		const fetchImages = async () => {
			if (loading || !hasMore) return; // Ne pas charger si déjà en cours ou s'il n'y a plus d'images
			setLoading(true);

			axios({ method: "GET", url: Routing.generate(URL_GET_DATA, { page: page }), data: {} })
				.then(function (response) {
					const data = response.data;
					setImages(prevImages => [...prevImages, ...JSON.parse(data.images)]); // Ajoute les nouvelles images à celles déjà chargées
					setHasMore(data.hasMore); // Met à jour s'il reste encore des images à charger
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
	}, [page]);

	// Gestion du scroll
	useEffect(() => {
		const handleScroll = () => {
			if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100 && hasMore) {
				setPage(prevPage => prevPage + 1); // Incrémente la page lorsque l'utilisateur arrive en bas de la page
			}
		};

		window.addEventListener('scroll', handleScroll); // Ajoute l'événement de scroll
		window.addEventListener('scroll', debounce(handleScroll, 200)); // 200ms de délai avant d'exécuter la fonction

		return () => window.removeEventListener('scroll', handleScroll); // Nettoie l'événement lors du démontage du composant
	}, [hasMore]);

	return (
		<div>
			<div className="mb-12 flex items-center justify-center">
				<ButtonA type="blue" onClick={Routing.generate(URL_DOWNLOAD_ARCHIVE)}>
					Télécharger toutes les photos
				</ButtonA>
			</div>
			<div className="masonry">
				{images.map((image, index) => (
					<a key={index} className="block masonry-item"
					   href={Routing.generate(URL_DOWNLOAD_FILE, { id: image.id })}
					   download={image.originalName}
					>
						<img src={Routing.generate(URL_READ_IMAGE, {id: image.id})} alt={`Photo ${index}`} />
					</a>
				))}
			</div>

			{loading && <div className="text-center text-gray-600 text-sm mt-4">Chargement...</div>}
			{!hasMore && <div className="text-center text-gray-600 text-sm mt-4">Plus d'images à afficher.</div>}
		</div>
	);
};

export default InfiniteGallery;
