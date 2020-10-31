import React, {Component} from 'react';
import Routing from '../../../../../../../../public/bundles/fosjsrouting/js/router.min.js';

export class Footer extends Component {
    render () {
        return <>
            <footer>
                <div className="footer">
                    <div className="footer-menu">
                        <div className="footer-logo">
                            <a href={Routing.generate('app_homepage')} title="Chanbora Chhun">
                                Shanbo - Chanbora Chhun développeur web fullstack à Marseille
                            </a>
                        </div>
                        <div className="footer-items">
                            <a rel="nofollow" href={Routing.generate('app_mentions')}>Mentions légales</a>
                            <a rel="nofollow" href={Routing.generate('app_politique')}>Politique de confidentialité</a>
                            <a rel="nofollow" href={Routing.generate('app_cookies')}>Gestion des cookies</a>
                        </div>
                    </div>
                    <div className="copyright">Copyright © 2020 - <a href={Routing.generate('app_homepage')}>Chanbora Chhun</a></div>
                </div>
            </footer>
        </>
    }
}