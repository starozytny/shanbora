import React, { useRef, useState, useEffect, Component } from 'react';
import { createPortal } from "react-dom";

import axios from "axios";
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

import Formulaire from "@commonFunctions/formulaire";
import ModalFunctions from '@commonFunctions/modal';

import { Button, ButtonA, ButtonIcon } from "@tailwindComponents/Elements/Button";
import { LightBox } from "@tailwindComponents/Elements/LightBox";

const URL_USER_HOMEPAGE = "user_homepage";
const URL_GET_DATA = "intern_api_user_gallery_images_fetch_images";
const URL_READ_IMAGE = "intern_api_user_gallery_images_read_image";
const URL_READ_IMAGE_HD = "intern_api_user_gallery_images_read_image_hd";
const URL_DOWNLOAD_FILE = "intern_api_user_gallery_images_download";
const URL_DOWNLOAD_ARCHIVE = "intern_api_user_gallery_albums_archive";
const URL_COVER_ALBUM = "intern_api_user_gallery_albums_cover";

const InfiniteGallery = ({ isAdmin, albumId, sortBy, albumName, albumDate }) => {
	const refLightbox = useRef(null);
	const [rankPhoto, setRankPhoto] = useState(1);
	const [images, setImages] = useState([]);
	const [currentImages, setCurrentImages] = useState([]);
	const [selectedImages, setSelectedImages] = useState(new Set());
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchImages = async () => {
			if (loading || !hasMore) return;
			setLoading(true);

			let url = Routing.generate(URL_GET_DATA, {page: page, albumId: albumId})
			if(isAdmin){
				url = Routing.generate(URL_GET_DATA, {page: page, albumId: albumId, isAdmin: isAdmin, sortBy: sortBy})
			}

			axios({ method: "GET", url: url, data: {} })
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

					setRankPhoto(prevRankPhoto => prevRankPhoto + 48)
					setImages(data);
					setCurrentImages(prevImages => [...prevImages, ...currentData]);
					setHasMore(response.data.hasMore);
				})
				.catch(function (error) {
					Formulaire.displayErrors(null, error);
				})
				.then(function () {
					setLoading(false);
				})
			;
		};

		fetchImages();
	}, [page]);

	const handleMore = () => {
		setPage(prevPage => prevPage + 1);
	};

	let handleLightbox = (elem) => {
		refLightbox.current.handleUpdateContent(<LightboxContent key={elem.rankPhoto} identifiant="lightbox" images={images} elem={elem} />);
		refLightbox.current.handleClick();
	}

	let handleCover = (imageId) => {
		Formulaire.loader(true);
		axios({ method: "PUT", url: Routing.generate(URL_COVER_ALBUM, {id: albumId}), data: {imageId: imageId} })
			.then(function (response) {
				location.reload();
			})
			.catch(function (error) {
				Formulaire.displayErrors(null, error);
				Formulaire.loader(false);
			})
		;
	}

	const toggleSelectImage = (imageId) => {
		setSelectedImages(prev => {
			const newSet = new Set(prev);
			if (newSet.has(imageId)) {
				newSet.delete(imageId);
			} else {
				newSet.add(imageId);
			}
			return newSet;
		});
	};

	const handleDownloadSelected = () => {
		if (selectedImages.size === 0) return;

		Formulaire.loader(true);
		const imageIds = Array.from(selectedImages);

		// Create download requests for each selected image
		Promise.all(
			imageIds.map(imageId =>
				axios({
					method: "GET",
					url: Routing.generate(URL_DOWNLOAD_FILE, { id: imageId }),
					responseType: 'blob'
				})
			)
		)
			.then(responses => {
				responses.forEach((response, index) => {
					const url = window.URL.createObjectURL(new Blob([response.data]));
					const link = document.createElement('a');
					link.href = url;
					link.setAttribute('download', `photo_${imageIds[index]}.jpg`);
					document.body.appendChild(link);
					link.click();
					link.remove();
				});
				Formulaire.loader(false);
			})
			.catch(error => {
				Formulaire.displayErrors(null, error);
				Formulaire.loader(false);
			});
	};

	return (
		<div>
			<section className="py-12 bg-gradient-to-br from-gray-50 to-white">
				<div className="max-w-7xl mx-auto px-6 lg:px-8">
					<div className="flex items-center gap-4 mb-6">
						<a href={Routing.generate(URL_USER_HOMEPAGE)} className="flex items-center gap-2 text-gray-600 hover:text-[#DAA520] transition-colors">
							<span className="icon-left-chevron"></span>
							<span className="text-sm font-medium">Retour aux albums</span>
						</a>
					</div>

					<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
						<div>
							<div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DAA520]/10 rounded-full mb-3">
								<span className="text-sm font-medium text-[#DAA520]">{albumDate || '#/11/2024'}</span>
							</div>
							<h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-2">
								{albumName || 'Album'}
							</h1>
							<p className="text-gray-600 text-lg">
								<span>{currentImages.length}</span> photo{currentImages.length > 1 ? 's' : ''} •
								<span className="ml-2">{selectedImages.size}</span> sélectionnée{selectedImages.size > 1 ? 's' : ''}
							</p>
						</div>

						<div className="flex flex-wrap gap-3">
							{!isAdmin && (
								<>
									<Button
										type="default"
										onClick={handleDownloadSelected}
										isDisabled={selectedImages.size === 0}
									>
										<span className="icon-download mr-2"></span>
										<span>Télécharger la sélection</span>
									</Button>
								</>
							)}
							<ButtonA type="yellow" onClick={Routing.generate(URL_DOWNLOAD_ARCHIVE, {id: albumId})}>
								<span className="icon-download mr-2"></span>
								<span>Télécharger tout</span>
							</ButtonA>
						</div>
					</div>
				</div>
			</section>

			<section className="py-12 bg-gray-50">
				<div className="max-w-7xl mx-auto px-6 lg:px-8">
					<div className="grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 pswp-gallery" id="gallery">
						<LazyLoadingGalleryWithPlaceholder
							currentImages={currentImages}
							isAdmin={isAdmin}
							selectedImages={selectedImages}
							onLightbox={handleLightbox}
							onCover={handleCover}
							onToggleSelect={toggleSelectImage}
						/>
					</div>

					<div className="mt-12">
						{loading && <div className="text-center text-gray-600 text-sm">Chargement...</div>}
						{!hasMore
							? <div className="text-center text-gray-600 text-sm">Toutes les photos sont affichées.</div>
							: <div className="flex items-center justify-center mt-8">
								<Button type="blue" onClick={handleMore}>Afficher plus</Button>
							</div>
						}
					</div>
				</div>
			</section>

			{createPortal(<LightBox ref={refLightbox} identifiant="lightbox" content={null}  />
				, document.body
			)}
		</div>
	);
};

function LazyLoadingGalleryWithPlaceholder ({ currentImages, onLightbox, onCover, isAdmin, selectedImages, onToggleSelect }) {
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
		const timeoutId = currentImages.map((_, index) =>
			setTimeout(() => {
				if (!loaded[index]) {
					handleImageError(index);
				}
			}, 500)
		);

		return () => {
			timeoutId.forEach((id) => clearTimeout(id));
		};
	}, [loaded]);

	const handleCheckboxClick = (e, imageId) => {
		e.stopPropagation();
		onToggleSelect(imageId);
	};

	return <>
		{currentImages.map((image, index) => (
			<div key={index} className="relative cursor-pointer flex items-center justify-center bg-gray-900 min-h-[205px] md:min-h-[332px] group gallery-item overflow-hidden rounded-md"
				 onClick={() => onLightbox(image)}>

				<div className={`w-full h-full bg-white flex items-center justify-center absolute top-0 left-0 ${!loaded[index] && !error[index] ? "opacity-100" : "opacity-0"}`}>
					<span className="icon-chart-3"></span>
				</div>
				{error[index]
					? <img
						src={Routing.generate(URL_READ_IMAGE, { id: image.id })}
						alt={`Photo ${image.originalName}`}
						className="pointer-events-none w-full h-auto rounded-md group-hover:scale-105 transition-transform"
					/>
					: <img
						src={Routing.generate(URL_READ_IMAGE, { id: image.id })}
						alt={`Photo ${image.originalName}`}
						className="pointer-events-none w-full h-auto rounded-lg group-hover:scale-105 transition-transform"
						loading="lazy"
						onLoad={() => handleImageLoad(index)}
						onError={() => handleImageError(index)}
					/>
				}

				{!isAdmin && (
					<div
						className={`absolute top-3 left-3 w-6 h-6 rounded-md border-2 border-white cursor-pointer transition-all ${
							selectedImages.has(image.id)
								? 'bg-[#DAA520] border-[#DAA520]'
								: 'bg-black/30 backdrop-blur-sm'
						}`}
						onClick={(e) => handleCheckboxClick(e, image.id)}
					>
						{selectedImages.has(image.id) && (
							<span className="icon-check1 text-white text-xs flex items-center justify-center h-full"></span>
						)}
					</div>
				)}

				{isAdmin && (
					<div className="absolute top-2 left-2 w-[calc(100%-1rem)] flex justify-between gap-2">
						<div className="bg-gray-300/80 w-6 h-6 rounded-full text-xs flex justify-center items-center">
							{image.nbDownload}
						</div>
						<ButtonIcon type="default" icon="image" tooltipPosition="-bottom-7 right-0" tooltipWidth={130}
									onClick={(e) => {
										e.stopPropagation();
										onCover(image.id);
									}}>
							Image de couverture
						</ButtonIcon>
					</div>
				)}
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
			<div className="fixed bg-gradient-to-t from-gray-800 to-black/30 bottom-0 md:bottom-auto md:top-0 md:bg-none left-0 w-full flex justify-between p-4 md:p-8 text-white z-20">
				<div className="text-gray-400">{elem.rankPhoto} / {images.length}</div>
				<div className="flex gap-4">
					<div>
						<a className="lightbox-action relative group" href={Routing.generate(URL_DOWNLOAD_FILE, { id: elem.id })} download>
							<span className="icon-download !text-2xl text-gray-400 group-hover:text-white" />
							<span className="tooltip bg-gray-300 text-black py-1 px-2 rounded absolute -top-10 right-0 text-xs hidden group-hover:block">Télécharger</span>
						</a>
					</div>
					<div>
						<div className="lightbox-action relative group close-modal cursor-pointer" onClick={this.handleCloseModal}>
							<span className="icon-close !text-2xl text-gray-400 group-hover:text-white" />
							<span className="tooltip bg-gray-300 text-black py-1 px-2 rounded absolute -top-7 right-0 text-xs hidden group-hover:block">Fermer</span>
						</div>
					</div>
				</div>
			</div>
			<div className="flex justify-center items-center w-full h-full">
				<div className="cursor-pointer fixed group top-0 h-[calc(100%-65px)] md:top-[97px] md:h-full left-0 flex items-center justify-center p-4 md:p-8 z-20 text-white"
					 onClick={() => this.handlePrev(actualRank > 1 ? actualRank : (images.length + 1))}>
					<span className="icon-left-chevron !text-2xl text-gray-400 group-hover:text-white"></span>
				</div>
				<div ref={this.gallery} className="relative flex justify-center items-center w-full h-full cursor-grab"
					 onMouseDown={this.handleMouseDown}
					 onMouseMove={this.handleMouseMove}
					 onMouseUp={this.handleMouseUp}
					 onMouseLeave={this.handleMouseUp}
					 onTouchStart={this.handleTouchStart}
					 onTouchMove={this.handleTouchMove}
					 onTouchEnd={this.handleTouchEnd}
				>
					{images.map(image => {
						return <div key={image.id} className={`${elem.id === image.id ? "opacity-100" : "opacity-0"} transition-opacity absolute top-0 left-0 w-full h-full`}>
							<img src={Routing.generate(URL_READ_IMAGE_HD, { id: elem.id })} alt={`Photo ${elem.originalName}`}
								 className="max-w-[1024px] mx-auto w-full h-full pointer-events-none object-contain select-none outline-none transition-transform"
								 style={{ transform: `translateX(${currentTranslate}px)` }} />
						</div>
					})}
				</div>
				<div className="cursor-pointer fixed group top-0 h-[calc(100%-65px)] md:top-[97px] md:h-full right-0 flex items-center justify-center p-4 md:p-8 z-20 text-white"
					 onClick={() => this.handleNext(actualRank < images.length ? actualRank : 1)}>
					<span className="icon-right-chevron !text-2xl text-gray-400 group-hover:text-white"></span>
				</div>
			</div>
		</>
	}
}

export default InfiniteGallery;
