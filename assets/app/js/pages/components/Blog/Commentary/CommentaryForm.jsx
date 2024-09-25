import React, { Component } from 'react';

import axios from "axios";
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

import Toastr from "@tailwindFunctions/toastr";
import Formulaire from "@commonFunctions/formulaire";
import Validateur from "@commonFunctions/validateur";

import { Button } from "@tailwindComponents/Elements/Button";
import { Input, TextArea } from "@tailwindComponents/Elements/Fields";

const URL_CREATE_ELEMENT = "intern_api_blog_commentaries_create";

export function CommentaryFormulaire ({ adventureId, adventureName, adventureUrl }) {
	let url = Routing.generate(URL_CREATE_ELEMENT);

	return <Form
        url={url}
		adventureId={adventureId}
		adventureName={adventureName}
		adventureUrl={adventureUrl}
    />
}

class Form extends Component {
	constructor (props) {
		super(props);

		this.state = {
			adventureId: props.adventureId,
			adventureName: props.adventureName,
			adventureUrl: props.adventureUrl,
			username: "",
			message: "",
			critere: "",
			errors: [],
		}
	}

	handleChange = (e) => {
		this.setState({ [e.currentTarget.name]: e.currentTarget.value })
	}

	handleSubmit = (e) => {
		e.preventDefault();

		const { url } = this.props;
		const { critere, username, message } = this.state;

		this.setState({ errors: [] });

		if (critere !== "") {
			Toastr.toast('error', "Veuillez rafraichir la page.");
		} else {
			let paramsToValidate = [
				{ type: "text", id: 'username', value: username },
				{ type: "text", id: 'message', value: message.html }
			];

			let validate = Validateur.validateur(paramsToValidate);
			if (!validate.code) {
				Formulaire.showErrors(this, validate);
			} else {
				let self = this;
				Formulaire.loader(true);
				axios({ method: "POST", url: url, data: this.state })
					.then(function (response) {
						Toastr.toast('error', "Commentaire enregistré.");
						location.reload();
					})
					.catch(function (error) {
						Formulaire.displayErrors(self, error);
						Formulaire.loader(false);
					})
				;
			}
		}
	}

	render () {
		const { errors, critere, username, message } = this.state;

		let params0 = { errors: errors, onChange: this.handleChange };

		return <form onSubmit={this.handleSubmit}>
			<div className="flex flex-col gap-4">
				<div className="max-w-96">
					<Input identifiant="username" valeur={username} {...params0}>Pseudo</Input>
					<div className="critere">
						<Input identifiant="critere" valeur={critere} {...params0}>Critère</Input>
					</div>
				</div>
				<div>
					<TextArea identifiant="message" valeur={message} {...params0}>Votre message</TextArea>
				</div>
			</div>
			<div className="mt-4">
				<Button isSubmit={true} type="blue">Envoyer</Button>
			</div>
		</form>
	}
}
