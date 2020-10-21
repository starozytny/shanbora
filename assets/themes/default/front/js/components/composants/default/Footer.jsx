import React, {Component} from 'react';
import Routing from '../../../../../../../../public/bundles/fosjsrouting/js/router.min.js';

export class Footer extends Component {
    render () {
        return <>
            <footer>
                <div className="footer">
                    <div className="footer-menu">
                        <div className="footer-logo">
                            <a href={Routing.generate('app_homepage')} title="Logilink">
                                <img src="../../build/themes/default/front/images/logo.svg" alt="Logo"/>
                            </a>
                            <span>Site internet</span>
                        </div>
                        <div className="footer-items">
                            <a rel="nofollow" href={Routing.generate('app_mentions')}>Mentions légales</a>
                            <a rel="nofollow" href={Routing.generate('app_politique')}>Politique de confidentialité</a>
                            <a rel="nofollow" href={Routing.generate('app_cookies')}>Gestion des cookies</a>
                            <a rel="nofollow" href={Routing.generate('app_login')}>Espace client</a>
                        </div>
                    </div>
                    <div className="copyright">Copyright © 2020 - <a href={Routing.generate('app_homepage')}>Logilink</a></div>
                </div>
            </footer>
        </>
    }
}