import React, { useRef } from "react";
import { createPortal } from "react-dom";

import axios from "axios";
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

import Formulaire from "@commonFunctions/formulaire";

import { Button } from "@tailwindComponents/Elements/Button";
import { Modal } from "@tailwindComponents/Elements/Modal";

const URL_INDEX_ELEMENTS = 'admin_galleries_index';
const URL_DELETE_ELEMENT = 'intern_api_user_gallery_albums_delete';

export function AlbumDelete ({ id, title })
{
    let modalRef = useRef(null);

    const handleClick = () => { modalRef.current.handleClick(); }

    const handleDelete = () => {
        let self = this;

        modalRef.current.handleUpdateFooter(<Button isLoader={true} type="red">Confirmer la suppression</Button>);
        axios({ method: "DELETE", url: Routing.generate(URL_DELETE_ELEMENT, {id: id}), data: {} })
            .then(function (response) {
                location.href = Routing.generate(URL_INDEX_ELEMENTS);
            })
            .catch(function (error) { Formulaire.displayErrors(self, error); Formulaire.loader(false); })
        ;
    }

    return <>
        <div className="text-sm underline cursor-pointer hover:text-gray-700" onClick={handleClick}>Supprimer</div>
        {createPortal(
            <Modal ref={modalRef} identifiant={`delete-tuto-${id}`} maxWidth={414} title="Supprimer un album"
                   content={<p>Êtes-vous sûr de vouloir supprimer ce album : <b>{title}</b> ?</p>}
                   footer={<Button type="red" onClick={handleDelete}>Confirmer la suppression</Button>} closeTxt="Annuler" />
            , document.body
        )}
    </>
}
