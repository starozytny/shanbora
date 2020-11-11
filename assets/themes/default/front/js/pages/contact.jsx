import '../../css/pages/contact.scss';

import Routing            from '@publicFolder/bundles/fosjsrouting/js/router.min.js';
import React              from 'react';
import ReactDOM           from 'react-dom';
import FormContact        from './components/contact/FormContact';

formulaire('form-contact');

function formulaire(elem){
    let form = document.querySelector('#' + elem);

    if(form !== null){
        ReactDOM.render(
            <FormContact url={Routing.generate('app_contact')}>
                Les informations recueillies à partir de ce formulaire sont 
                transmises à Chanbora Chhun pour traiter vos demandes.
                <br />
                Pour plus d'informations, veuillez consulter <a href={Routing.generate('app_politique')}>notre politique de confidentialité</a>.
            </FormContact>,
            form
        );
    }
}