import '../../css/pages/legales.scss';

import Routing            from '@publicFolder/bundles/fosjsrouting/js/router.min.js';
import React              from 'react';
import ReactDOM           from 'react-dom';
import FormRgpd           from './components/legales/FormRgpd';
import {ActionCookies}    from '../components/composants/Cookies';

cookies();
formulaire('form-rgpd');

function formulaire(elem){
    let form = document.querySelector('#' + elem);

    if(form !== null){
        ReactDOM.render(
            <FormRgpd url={Routing.generate('app_rgpd')} >
                Les informations recueillies à partir de ce formulaire sont 
                transmises à Chanbora Chhun pour traiter vos demandes.
                <br />
                Pour plus d'informations, veuillez consulter <a href={Routing.generate('app_politique')}>notre politique de confidentialité</a>.
            </FormRgpd>,
            form
        );
    }
}



function cookies(){
    renderBtn('analytics', document.getElementById('cookies-analytics-actions'));
    renderBtn('interne', document.getElementById('cookies-interne-actions'));

    function renderBtn(type, elem){
        if(elem !== null){
            ReactDOM.render(
                <ActionCookies type={type}/>,
                elem
            );
        }
    }
}