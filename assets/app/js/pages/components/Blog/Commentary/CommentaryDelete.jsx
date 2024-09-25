import React, { Component } from 'react';
import { createPortal } from "react-dom";

import { ModalDelete } from "@tailwindComponents/Shortcut/Modal";

const URL_DELETE_ELEMENT = "intern_api_blog_commentaries_delete";

export class CommentaryDelete extends Component {
	constructor (props) {
		super(props);

		this.delete = React.createRef();
	}

	handleModal = () => {
		this.delete.current.handleClick();
	}

	render () {
		const { id } = this.props;

		return <>
			<div className="cursor-pointer text-xs text-red-500 underline hover:text-red-700" onClick={() => this.handleModal()}>
				Supprimer
			</div>

			{createPortal(
				<ModalDelete refModal={this.delete} identifiant={`delete-${id}`} element={{id: id}} routeName={URL_DELETE_ELEMENT}
							 title="Supprimer ce commentaire" msgSuccess="Commentaire supprimé">
					Êtes-vous sûr de vouloir supprimer définitivement ce commentaire ?
				</ModalDelete>,
				document.body
			)}
		</>
	}
}
