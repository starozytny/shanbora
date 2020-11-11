import React, {Component} from 'react';

import {Input, TextArea, Select}  from '@reactFolder/composants/Fields';
import {Formulaire}       from '@reactFolder/composants/Formulaire';
import Validateur         from '@reactFolder/functions/validateur';
import AjaxSend           from '@reactFolder/functions/ajax_classique';

import ReCAPTCHA from "react-google-recaptcha";

class FormRgpd extends Component {
    constructor(props) {
        super(props);

        this.state = {
            success: '',
            error: '',
            firstname: { value: '', error: '' },
            email: { value: '', error: '' },
            subject: { value: "0", error: '' },
            message: { value: '', error: '' }
        }

        this.recaptchaRef = React.createRef();

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e){
        const name = e.target.name;
        const value = e.target.value;
        this.setState({
            success: '',
            [name]: {value: value}
        });
    } 

    handleSubmit(e){
        e.preventDefault();
        const {firstname, email, subject, message} = this.state;

        //Validation
        let validate = Validateur.validateur([
            {type: "text", id: 'firstname', value: firstname.value},
            {type: "email", id: 'email', value: email.value},
            {type: "text", id: 'subject', value: subject.value},
            {type: "text", id: 'message', value: message.value}
        ]);

        //Recaptcha
        this.recaptchaRef.current.executeAsync().then(value => {
            if(value !== null){
                //Display error if validate != true else call Ajax password lost
                if(!validate.code){
                    this.setState(validate.errors);
                }else{
                    AjaxSend.sendAjax(this, this.props.url, this.state, {
                        firstname: { value: '', error: '' },
                        email: { value: '', error: '' },
                        subject: { value: "0", error: '' },
                        message: { value: '', error: '' }
                    });
                }
                this.recaptchaRef.current.reset();
            }
        })      
    }

    render() {
        const {children} = this.props;
        const {success, error, firstname, email, subject, message} = this.state;
        const items = [
            {'value': 0, 'libelle': "Droit d'accès sur un traitement de données."},
            {'value': 1, 'libelle': "Droit de rectification sur un traitement de données."},
            {'value': 2, 'libelle': "Droit à l'effacement sur un traitement de données."},
            {'value': 3, 'libelle': "Autre demande concernant un traitement de données."}
        ]
        return (
            <>
                <Formulaire 
                    onSubmit={this.handleSubmit}
                    success={success}
                    error={error}
                    inputs={
                        <>
                            <div className="line line-2">
                                <Input valeur={firstname} identifiant="firstname" onChange={this.handleChange}>Nom / Raison sociale</Input>
                                <Input valeur={email} identifiant="email" onChange={this.handleChange}>Email</Input>
                            </div>
                            <div className="line">
                                <Select valeur={subject} identifiant="subject" onChange={this.handleChange} items={items}>Objet du message</Select>
                            </div>
                            <div className="line">
                                <TextArea valeur={message} identifiant="message" onChange={this.handleChange}>Message</TextArea>
                            </div>
                            <ReCAPTCHA ref={this.recaptchaRef} size={"invisible"} sitekey="6LeJXdUUAAAAABW3t8yl9tkJ5PpSFdhKqvOpgGyY" />
                        </>
                    }
                    btn="Envoyer"
                    children={children}
                />
            </>
        );
    }
}

export default FormRgpd;