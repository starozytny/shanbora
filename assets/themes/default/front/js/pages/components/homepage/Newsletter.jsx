import React, {Component} from 'react';
import axios from 'axios/dist/axios';
import Routing from '../../../../../../../../public/bundles/fosjsrouting/js/router.min'
import { Input} from '../../../../../react/composants/Fields';
import Validateur from "../../../../../react/functions/validateur";
import Loader from "../../../../../react/functions/loader";
import ActionsArray from "../../../../../react/functions/actions_array";
import toastr from "toastr";
import {Alert} from "../../../../../react/composants/Alert";

export class Newsletter extends Component{
    constructor(props) {
        super();

        this.state = {
            error: '',
            success: '',
            email: {value: '', error: ''}
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange = (e) => {
        let name = e.currentTarget.name;
        let value = e.currentTarget.value;
        this.setState({ succes:'', [name]: {value: value}})
    }

    handleSubmit = (e) => {
        e.preventDefault();

        const {email} = this.state

        let validate = Validateur.validateur([
            {type: "email", id: 'email', value: email.value}
        ]);

        if(!validate.code){
            this.setState(validate.errors);
        }else{
            Loader.loader(true)

            let self = this
            axios({ method: 'post', url: Routing.generate('app_newsletter'), data: self.state }).then(function (response) {
                let data = response.data; let code = data.code; Loader.loader(false)

                if(code === 1){
                    self.setState({error: '', success: data.message})
                }else{
                    self.setState({error: data.message, success: ''})
                }
            });
        }
    }

    render () {
        const {error, success, email} = this.state

        return <>
            <form onSubmit={this.handleSubmit}>
                {success != '' ? <Alert type="success" message={success} /> : null}
                {error != '' ? <Alert type="danger" message={error} /> : null}
                <div className="inputs">
                    <div className="line">
                        <Input type="email" identifiant="email" placeholder="Ton adresse e-mail" valeur={email} onChange={this.handleChange}>Adresse e-mail</Input>
                    </div>
                    <div className="form-button">
                        <button type="submit" className="btn btn-primary"><span className="icon-mail"></span><span>Rester informer</span></button>
                    </div>
                </div>
            </form>
        </>
    }
}