import React, {Component} from 'react';
import Routing from '../../../../../../../../public/bundles/fosjsrouting/js/router.min.js';

function setUnderlineActive(elementActive){
    let underline = document.querySelector('.nav-items-active');
    if(underline){
        underline.style.width = elementActive.offsetWidth + 'px'
        underline.style.left = elementActive.offsetLeft + 'px'
    }
}

export class Menu extends Component {
    constructor(props){
        super();

        this.state = {
            menu: JSON.parse(props.menu),
            active: 'dashboard'
        }

        this.handleHover = this.handleHover.bind(this)
        this.handleLeave = this.handleLeave.bind(this)
    }

    componentDidMount () {
        let tab = location.pathname.split("/");
        tab = tab.filter(elem => elem != "");

        if(tab.length === 0){ tab.push('logilink') }

        tab.forEach(element => {
            this.state.menu.forEach(el => {
                if(element == el.name){
                    this.setState({active: element})
                    setUnderlineActive(document.querySelector('.nav-item-' + element))
                }
            })
        });
    }

    handleHover = (e) => { setUnderlineActive(e.currentTarget) }

    handleLeave = (e) => { setUnderlineActive(document.querySelector('.nav-item-' + this.state.active)) }

    render () {
        const {menuOpened, onCloseMenu, onOpenMenu} = this.props;
        const {menu, active} = this.state;

        let menuItems = menu.map((elem, index) => {
            return <a href={elem.path} className={"nav-item nav-item-"+ elem.name + ((active == elem.name) ? " active" : "")} 
                      onMouseOver={this.handleHover} 
                      onMouseLeave={this.handleLeave} 
                      key={index}
                    >
                        <span>{elem.label}</span>
                    </a>
        })

        return <>
            <nav className={menuOpened}>
                <div className="nav-header">
                    <a href={Routing.generate('app_homepage')} title="Logilink">
                        <img src="../../build/themes/default/front/images/logo.svg" alt="logo"/>
                    </a>
                    <div className="nav-header-actions">
                        <span className={"icon-menu " + (menuOpened == "" ? "active" : null)} onClick={onOpenMenu}></span>
                        <span className={"icon-cancel " + (menuOpened == "" ? null : "active")} onClick={onCloseMenu}></span>
                    </div>
                </div>
                <div className="nav-body">
                    <div className="nav-items">
                        {menuItems}
                        <div className="nav-items-active"></div>
                    </div>
                </div>
            </nav>
        </>
    }
}