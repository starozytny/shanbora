import React, { Component } from 'react';
import { createPortal } from "react-dom";

import { Modal } from "@tailwindComponents/Elements/Modal";
import { CommentaryFormulaire } from "@appFolder/pages/components/Blog/Commentary/CommentaryForm";

export class CommentaryResponse extends Component {
	constructor (props) {
		super(props);

		this.response = React.createRef();
	}

	handleModal = () => {
		this.response.current.handleClick();
	}

	render () {
		const { id } = this.props;

		let props = this.props;

		return <>
			<div className="cursor-pointer text-xs text-black underline hover:text-gray-800" onClick={() => this.handleModal()}>
				Répondre
			</div>

			{createPortal(
				<Modal ref={this.response} identifiant={`response-${id}`} maxWidth={768}
					   title="Répondre à un commentaire" isForm={true}
					   content={<CommentaryFormulaire {...props} responseId={id} isForm={true} identifiant={`response-${id}`} />}>
				</Modal>,
				document.body
			)}
		</>
	}
}
