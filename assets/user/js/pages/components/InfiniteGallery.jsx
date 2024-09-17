import React, { useRef, useState, useEffect, Component } from 'react';
import { createPortal } from "react-dom";

import axios from "axios";
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

import Formulaire from "@commonFunctions/formulaire";
import ModalFunctions from '@commonFunctions/modal';

import { Button, ButtonA } from "@tailwindComponents/Elements/Button";
import { LightBox } from "@tailwindComponents/Elements/LightBox";

const URL_GET_DATA = "intern_api_user_gallery_fetch_images";
const URL_READ_IMAGE = "intern_api_user_gallery_read_image";
const URL_READ_IMAGE_HD = "intern_api_user_gallery_read_image_hd";
const URL_DOWNLOAD_FILE = "intern_api_user_gallery_download";
const URL_DOWNLOAD_ARCHIVE = "intern_api_user_gallery_archive";

const InfiniteGallery = () => {
	const refLightbox = useRef(null);
	const [rankPhoto, setRankPhoto] = useState(1); // Stocke les images
	const [images, setImages] = useState([]); // Stocke les images
	const [currentImages, setCurrentImages] = useState([]); // Stocke les imagesI
	const [page, setPage] = useState(1);      // Page courante
	const [hasMore, setHasMore] = useState(true); // Indique s'il reste des images à charger
	const [loading, setLoading] = useState(false); // Indique si un chargement est en cours

	useEffect(() => {
		// Fonction pour récupérer les images
		const fetchImages = async () => {
			if (loading || !hasMore) return; // Ne pas charger si déjà en cours ou s'il n'y a plus d'images
			setLoading(true);

			axios({ method: "GET", url: Routing.generate(URL_GET_DATA, {page: page}), data: {} })
				.then(function (response) {
					let data = JSON.parse(response.data.images);
					let currentData = JSON.parse(response.data.currentImages);

					let i = 1;
					data.forEach(item => {
						item.rankPhoto = i++;
					})
					let j = rankPhoto;
					currentData.forEach(item => {
						item.rankPhoto = j++;
					})

					setRankPhoto(prevRankPhoto => prevRankPhoto + 18)
					setImages(data);
					setCurrentImages(prevImages => [...prevImages, ...currentData]); // Ajoute les nouvelles images à celles déjà chargées
					setHasMore(response.data.hasMore); // Met à jour s'il reste encore des images à charger
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

	const handleMore = () => {
		setPage(prevPage => prevPage + 1);
	};

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
			<div className="grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 pswp-gallery" id="gallery">
				<LazyLoadingGalleryWithPlaceholder currentImages={currentImages} onLightbox={handleLightbox} />
			</div>

			<div className="mt-12">
				{loading && <div className="text-center text-gray-600 text-sm">Chargement...</div>}
				{!hasMore
					? <div className="text-center text-gray-600 text-sm">Plus d'images à afficher.</div>
					: <div className="flex items-center justify-center mt-8">
						<Button type="default" onClick={handleMore}>Afficher plus</Button>
					</div>
				}
			</div>


			{createPortal(<LightBox ref={refLightbox} identifiant="lightbox" content={null}  />
				, document.body
			)}
		</div>
	);
};

function LazyLoadingGalleryWithPlaceholder ({ currentImages, onLightbox }) {
	const [loaded, setLoaded] = useState(Array(currentImages.length).fill(false));
	const [error, setError] = useState(Array(currentImages.length).fill(false));

	const handleImageLoad = (index) => {
		const updatedLoaded = [...loaded];
		updatedLoaded[index] = true;
		setLoaded(updatedLoaded);
	};

	const handleImageError = (index) => {
		const updatedError = [...error];
		updatedError[index] = true;
		setError(updatedError);
	};

	useEffect(() => {
		// Timeout de 5 secondes pour chaque image
		const timeoutId = currentImages.map((_, index) =>
			setTimeout(() => {
				if (!loaded[index]) {
					handleImageError(index);
				}
			}, 2000) // 2 secondes
		);

		return () => {
			// Nettoyer le timeout à la fin
			timeoutId.forEach((id) => clearTimeout(id));
		};
	}, [loaded]);

	return <>
		{currentImages.map((image, index) => (
			<div key={index} className="relative cursor-pointer min-h-[205px] md:min-h-[332px] group block gallery-item overflow-hidden rounded-md" onClick={() => onLightbox(image)}>
				<div className={`w-full h-full bg-white flex items-center justify-center absolute top-0 left-0 ${!loaded[index] && !error[index] ? "opacity-100" : "opacity-0"}`}>
					<span className="icon-chart-3"></span>
				</div>
				{error[index]
					? <div className="w-full h-full bg-white flex items-center justify-center">
						Rafraichir la page..
					</div>
					: <img
						src={Routing.generate(URL_READ_IMAGE, { id: image.id })}
						alt={`Photo ${image.originalName}`}
						className="pointer-events-none w-full h-auto rounded-md group-hover:scale-105 transition-transform"
						loading="lazy"
						onLoad={() => handleImageLoad(index)} // Appelé quand l'image est chargée
						onError={() => handleImageError(index)} // En cas d'erreur de chargement
					/>
				}
			</div>
		))}
	</>
}

export class LightboxContent extends Component {
	constructor (props) {
		super(props);

		this.state = {
			elem: props.elem ? props.elem : null,
			actualRank: props.elem ? props.elem.rankPhoto : 1,
			currentIndex: 0,
			isDragging: false,
			startX: 0,
			currentTranslate: 0,
		}

		this.gallery = React.createRef();
	}

	handleCloseModal = (e) => {
		e.preventDefault();

		const { identifiant } = this.props;

		let [body, modal, modalContent, btns] = ModalFunctions.getElements(identifiant);

		ModalFunctions.closeM(body, modal, modalContent);
	}

	handleMouseDown = (e) => {
		this.setState({
			isDragging: true,
			startX: e.clientX,
		})
		this.gallery.current.style.cursor = 'grabbing';
	};

	handleTouchStart = (e) => {
		this.setState({ isDragging: true, startX: e.targetTouches[0].clientX })
	};

	handleMouseMove = (e) => {
		const { isDragging, startX } = this.state;

		if (!isDragging) return;
		this.setState({ currentTranslate: e.clientX - startX })
	};

	handleTouchMove = (e) => {
		const { isDragging, startX } = this.state;

		if (!isDragging) return;
		this.setState({ currentTranslate: e.touches[0].clientX - startX })
	};

	handleMouseUp = () => {
		this.setState({ isDragging: false })
		this.gallery.current.style.cursor = 'grab';
		this.handleSwipeEnd();
	};

	handleTouchEnd = () => {
		this.setState({ isDragging: false })
		this.handleSwipeEnd();
	};

	handleSwipeEnd = () => {
		const { actualRank, currentTranslate } = this.state;

		if (currentTranslate > 50) {
			this.handlePrev(actualRank);
		} else if (currentTranslate < -50) {
			this.handleNext(actualRank);
		}
		this.setState({ currentTranslate: 0 })
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
		const { actualRank, elem, currentTranslate } = this.state;

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
				<div className="cursor-pointer fixed group h-full top-[56px] left-0 flex items-center justify-center p-4 md:p-8 z-20 text-white"
					 onClick={() => this.handlePrev(actualRank > 1 ? actualRank : (images.length + 1))}>
					<span className="icon-left-chevron !text-2xl text-gray-400 group-hover:text-white"></span>
				</div>
				<div ref={this.gallery} className="flex justify-center items-center h-full"
					 onMouseDown={this.handleMouseDown}
					 onMouseMove={this.handleMouseMove}
					 onMouseUp={this.handleMouseUp}
					 onMouseLeave={this.handleMouseUp}
					 onTouchStart={this.handleTouchStart}
					 onTouchMove={this.handleTouchMove}
					 onTouchEnd={this.handleTouchEnd}
				>
					{images.map(image => {
						return <div key={image.id} className={`${elem.id === image.id ? "block" : "hidden"} w-full h-full`}>
							<img src={Routing.generate(URL_READ_IMAGE_HD, { id: elem.id })} alt={`Photo ${elem.originalName}`}
								 className="w-full h-full pointer-events-none object-contain select-none outline-none"
								 style={{ transform: `translateX(${currentTranslate}px)` }} />
						</div>
					})}
				</div>
				<div className="cursor-pointer fixed group h-full top-[56px] right-0 flex items-center justify-center p-4 md:p-8 z-20 text-white"
					 onClick={() => this.handleNext(actualRank < images.length ? actualRank : 1)}>
					<span className="icon-right-chevron !text-2xl text-gray-400 group-hover:text-white"></span>
				</div>
			</div>
		</>
	}
}

export default InfiniteGallery;
