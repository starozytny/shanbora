import React, {Component} from 'react';
import axios              from 'axios/dist/axios';

import Loader             from '@reactFolder/functions/loader';
import {Radiobox}         from '@reactFolder/composants/Fields';
import {Alert}            from '@reactFolder/composants/Alert';
import {Drop}             from '@reactFolder/composants/Drop';

export class AsideImport extends Component {
    constructor (props) {
        super()

        this.state = {
            error: '',
            anomalies: [],
            urlAnomalie: null,
            filenameAnomalie: '',
            choices: {value: 0, error: ''},
            file: ''
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleGetFile = this.handleGetFile.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleBack = this.handleBack.bind(this)
    }

    handleChange = (e) => { 
        let name = e.currentTarget.name;
        let value = e.currentTarget.value;

        this.setState({[name]: {value: value, error: ''}}) 
    }

    handleGetFile = (e) => { this.setState({file: e.file}) }

    handleBack = (e) => {
        e.preventDefault();

        this.setState({anomalies: [], error: ''})
    }

    handleSubmit = (e) => {
        e.preventDefault()

        const {file, choices} = this.state
        const {urlForm} = this.props

        Loader.loader(true)
        let poursuivre = 0;
        if(document.getElementsByName('poursuivre')[0] != undefined){
            poursuivre = document.getElementsByName('poursuivre')[0].value;
        }
        let fd = new FormData();
        fd.append('file', file);
        fd.append('choice', choices.value);
        fd.append('poursuivre', poursuivre)
        
        let self = this
        axios({ method: 'post', url: urlForm, data: fd, headers: {'Content-Type': 'multipart/form-data'} }).then(function (response) {
            let data = response.data; let code = data.code;
            if (code === 1) {
                location.reload()
            }else{
                Loader.loader(false);
                self.setState({error: data.message})

                if(data.anomalies){
                    self.setState({anomalies: data.anomalies, urlAnomalie: data.urlAnomalie, filenameAnomalie: data.filename})
                }
            }
        });
    }

    render () {
        const {error, choices, anomalies, urlAnomalie, filenameAnomalie} = this.state

        let choiceItems = [
            { 'id': 1, 'value': 0, 'label': 'Ne pas écraser les données', 'identifiant': 'ne-pas-ecraser', 'checked': false },
            { 'id': 2, 'value': 1, 'label': 'Ecraser les données', 'identifiant': 'ecraser', 'checked': false },
        ]

        choiceItems.map(el => {
            if (choices.value == el.value){ el.checked = true }
        })

        let anomaliesItems = anomalies.map((el, index) => {
            return <div key={index} className="anomalie">
                <div className="anomalie-id">{el.id != "" ? el.id : "#"}</div>
                <div className="anomalie-username">{el.username != "" ? el.username : "#"}</div>
                <div className="anomalie-email">{el.email != "" ? el.email : "#"}</div>
            </div>
        })

        return <>
            <div className="aside-user-informations">
                <p>Fichier CSV doit au moins contenir les propriétés suivantes : (id, username, email)</p>
                <div className="alert alert-warning">
                    <i>Ecraser les données</i> se fait en fonction de l'id et/ou username et/ou email. <br/>
                    Ces trois propriétés doivent être unique.
                </div>
            </div>
            <form className="aside-user-form" onSubmit={this.handleSubmit}>
                {error != '' ? <Alert type="danger" message={error} active="true" /> : null}
                {anomalies.length != 0 ? <>
                    <div className="anomalies">
                        {anomaliesItems}
                    </div>
                    <input type="hidden" name="poursuivre" value="1" />
                    <div className="form-button">
                        <button className="btn" onClick={this.handleBack}><span>Retour</span></button>
                        <a href={urlAnomalie} download={filenameAnomalie} className="btn btn-primary"><span>Télécharger les doublons</span></a>
                        <button type="submit" className="btn btn-danger"><span>Poursuivre l'import</span></button>
                    </div>
                </>
                : <>
                    <div className="line">
                        <label>Fichier au format CSV</label>
                        <div className="form-files">
                            <Drop label="Téléverser le fichier" labelError="Seul les fichiers au format CSV sont acceptées."
                                accept={".csv"} maxFiles={1} onGetFile={this.handleGetFile}/>
                        </div>
                    </div>
                    <div className="line">
                        <Radiobox items={choiceItems} name="choices" valeur={choices} onChange={this.handleChange}></Radiobox>
                    </div>
                    <div className="form-button">
                        <button type="submit" className="btn btn-primary"><span>Importer</span></button>
                    </div>
                </> }
            </form>
        </>
    }
}