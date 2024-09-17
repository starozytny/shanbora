import React, { useRef, useState, useEffect, Component } from 'react';
import { createPortal } from "react-dom";

import axios from "axios";
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

import Formulaire from "@commonFunctions/formulaire";
import ModalFunctions from '@commonFunctions/modal';

import { ButtonA } from "@tailwindComponents/Elements/Button";
import { LightBox } from "@tailwindComponents/Elements/LightBox";

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
		refLightbox.current.handleUpdateContent(<LightboxContent key={elem.rankPhoto} identifiant="lightbox" images={images} elem={elem} />);
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
					<div key={image.id} className="cursor-pointer group block gallery-item bg-white overflow-hidden" onClick={() => handleLightbox(image)}>
						<img src={Routing.generate(URL_READ_IMAGE, { id: image.id })} alt={`Photo ${image.originalName}`}
							 className="pointer-events-none group-hover:scale-105 transition-transform" loading="lazy"/>
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
			actualRank: props.elem ? props.elem.rankPhoto : 1,
			currentIndex: 0,
			touchStartX: 0,
			touchEndX: 0,
		}
	}

	handleCloseModal = (e) => {
		e.preventDefault();

		const { identifiant } = this.props;

		let [body, modal, modalContent, btns] = ModalFunctions.getElements(identifiant);

		ModalFunctions.closeM(body, modal, modalContent);
	}

	handleTouchStart = (e) => {
		this.setState({ touchStartX: e.targetTouches[0].clientX })
	};

	handleTouchMove = (e) => {
		this.setState({ touchEndX: e.targetTouches[0].clientX })
	};

	handleTouchEnd = () => {
		const { actualRank, touchStartX, touchEndX } = this.state;

		if (touchStartX - touchEndX > 50) {
			this.handleNext(actualRank);
		}

		if (touchStartX - touchEndX < -50) {
			this.handlePrev(actualRank);
		}
	};

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
			<div className="fixed bg-gradient-to-t from-gray-800 to-transparent bottom-0 md:bottom-auto md:top-0 md:bg-none left-0 w-full flex justify-between p-4 md:p-8 text-white z-20">
				<div className="text-gray-400">{elem.rankPhoto} / {images.length}</div>
				<div className="flex gap-4">
					<div>
						<a className="lightbox-action relative group" href={Routing.generate(URL_DOWNLOAD_FILE, { id: elem.id })} download>
							<span className="icon-download !text-2xl text-gray-400 group-hover:text-white" />
							<span className="tooltip bg-gray-300 text-black py-1 px-2 rounded absolute -top-10 right-0 text-xs hidden">Télécharger</span>
						</a>
					</div>
					<div>
						<div className="lightbox-action relative group close-modal cursor-pointer" onClick={this.handleCloseModal}>
							<span className="icon-close !text-2xl text-gray-400 group-hover:text-white" />
							<span className="tooltip bg-gray-300 text-black py-1 px-2 rounded absolute -top-7 right-0 text-xs hidden">Supprimer</span>
						</div>
					</div>
				</div>
			</div>
			<div className="flex justify-center items-center h-full">
				{actualRank > 1
					? <div className="cursor-pointer fixed group h-full top-[56px] left-0 flex items-center justify-center p-4 md:p-8 z-20 text-white"
						   onClick={() => this.handlePrev(actualRank)}>
						<span className="icon-left-chevron !text-2xl text-gray-400 group-hover:text-white"></span>
					</div>
					: null
				}
				<div className="flex justify-center items-center h-full"
					onTouchStart={this.handleTouchStart}
					onTouchMove={this.handleTouchMove}
					onTouchEnd={this.handleTouchEnd}
				>
					{images.map(image => {
						return <div key={image.id} className={`${elem.id === image.id ? "block" : "hidden"} w-full h-full`}>
							<img src={Routing.generate(URL_READ_IMAGE_HD, { id: elem.id })} alt={`Photo ${elem.originalName}`} className="w-full h-full pointer-events-none object-contain" />
						</div>
					})}
				</div>
				{actualRank < images.length
					? <div className="cursor-pointer fixed group h-full top-[56px] right-0 flex items-center justify-center p-4 md:p-8 z-20 text-white"
						   onClick={() => this.handleNext(actualRank)}>
						<span className="icon-right-chevron !text-2xl text-gray-400 group-hover:text-white"></span>
					</div>
					: null
				}
			</div>
		</>
	}
}

export default InfiniteGallery;
