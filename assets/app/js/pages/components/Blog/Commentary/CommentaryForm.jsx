import React, { Component } from 'react';

import axios from "axios";
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

import Toastr from "@tailwindFunctions/toastr";
import Formulaire from "@commonFunctions/formulaire";
import Validateur from "@commonFunctions/validateur";

import { Button } from "@tailwindComponents/Elements/Button";
import { CloseModalBtn } from "@tailwindComponents/Elements/Modal";
import { Input, TextArea } from "@tailwindComponents/Elements/Fields";

const URL_CREATE_ELEMENT = "intern_api_blog_commentaries_create";

export function CommentaryFormulaire ({ adventureId, adventureName, adventureUrl, responseId = null, isForm = false, identifiant }) {
	let url = Routing.generate(URL_CREATE_ELEMENT);

	return <Form
        url={url}
		isForm={isForm}
		identifiant={identifiant}
		adventureId={adventureId}
		adventureName={adventureName}
		adventureUrl={adventureUrl}
		responseId={responseId}
    />
}

class Form extends Component {
	constructor (props) {
		super(props);

		this.state = {
			adventureId: props.adventureId,
			adventureName: props.adventureName,
			adventureUrl: props.adventureUrl,
			responseId: props.responseId,
			username: "",
			message: "",
			critere: "",
			errors: [],
			loadSendData: false
		}
	}

	handleChange = (e) => {
		this.setState({ [e.currentTarget.name]: e.currentTarget.value })
	}

	handleSubmit = (e) => {
		e.preventDefault();

		const { url } = this.props;
		const { critere, username, message } = this.state;

		this.setState({ errors: [], loadSendData: true });

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
					.then(function () {
						self.setState({ loadSendData: false })
					})
				;
			}
		}
	}

	render () {
		const { isForm, identifiant } = this.props;
		const { loadSendData, errors, critere, username, message } = this.state;

		let params0 = { errors: errors, onChange: this.handleChange };

		if(isForm){
			return <>
				<div className="px-4 pb-4 pt-5 sm:px-6 sm:pb-4">
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
				</div>
				<div className="bg-gray-50 px-4 py-3 flex flex-row justify-end gap-2 sm:px-6 border-t">
					<CloseModalBtn identifiant={identifiant} />
					{!loadSendData
						? <Button type="blue" isSubmit={true} onClick={this.handleSubmit}>Envoyer</Button>
						: <Button type="blue" iconLeft="chart-3">Envoyer</Button>
					}
				</div>
			</>
		} else {
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
}
