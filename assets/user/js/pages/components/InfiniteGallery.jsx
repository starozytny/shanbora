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
					let data = response.data;

					let i = 1;
					data.forEach(item => {
						item.rankPhoto = i++;
					})

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
	constructor (props) {
		super(props);

		this.state = {
			elem: props.elem ? props.elem : null,
			actualRank: props.elem ? props.elem.rankPhoto : 1
		}
	}

	handleCloseModal = (e) => {
		e.preventDefault();

		const { identifiant } = this.props;

		let [body, modal, modalContent, btns] = ModalFunctions.getElements(identifiant);

		ModalFunctions.closeM(body, modal, modalContent);
	}

	handleNext = (rankPhoto) => {
		const { images } = this.props;
		const { elem } = this.state;

		let nRank = rankPhoto + 1;

		if(nRank > images.length){
			nRank = rankPhoto;
		}

		let nElem = elem;
		images.forEach(image => {
			if(image.rankPhoto === nRank){
				nElem = image;
			}
		})

		this.setState({ actualRank: nRank, elem: nElem })
	}

	handlePrev = (rankPhoto) => {
		const { images } = this.props;
		const { elem } = this.state;

		let nRank = rankPhoto - 1;

		if(nRank < 1){
			nRank = rankPhoto;
		}

		let nElem = elem;
		images.forEach(image => {
			if(image.rankPhoto === nRank){
				nElem = image;
			}
		})

		this.setState({ actualRank: nRank, elem: nElem })
	}

	render () {
		const { images } = this.props;
		const { actualRank, elem } = this.state;

		if(!elem){
			return;
		}

		return <>
			<div className="fixed top-0 left-0 w-full flex justify-between p-4 md:p-8 text-white z-20">
				<div>{elem.rankPhoto} / {images.length} photos</div>
				<div className="flex gap-4">
					<div>
						<a className="lightbox-action relative" href={Routing.generate(URL_DOWNLOAD_FILE, { id: elem.id })} download>
							<span className="icon-download !text-2xl" />
							<span className="tooltip bg-gray-300 text-black py-1 px-2 rounded absolute -top-10 right-0 text-xs hidden">Télécharger</span>
						</a>
					</div>
					<div>
						<div className="lightbox-action relative close-modal cursor-pointer" onClick={this.handleCloseModal}>
							<span className="icon-close !text-2xl" />
							<span className="tooltip bg-gray-300 text-black py-1 px-2 rounded absolute -top-7 right-0 text-xs hidden">Supprimer</span>
						</div>
					</div>
				</div>
			</div>
			<div className="flex justify-center items-center h-full">
				{actualRank > 1
					? <div className="cursor-pointer fixed h-full top-1/2 left-4 md:left-8 z-20 text-white"
						   onClick={() => this.handlePrev(actualRank)}>
						<span className="icon-left-chevron !text-2xl"></span>
					</div>
					: null
				}
				{images.map((image, index) => {
					return <div key={image.id} className={`${elem.id === image.id ? "block" : "hidden"} w-full h-full`}>
						<img src={Routing.generate(URL_READ_IMAGE_HD, { id: elem.id })} alt={`Photo ${elem.originalName}`} className="w-full h-full object-contain" />
					</div>
				})}
				{actualRank < images.length
					? <div className="cursor-pointer fixed h-full top-1/2 right-4 md:right-8 z-20 text-white"
						   onClick={() => this.handleNext(actualRank)}>
						<span className="icon-right-chevron !text-2xl"></span>
					</div>
					: null
				}
			</div>
		</>
	}
}

export default InfiniteGallery;
