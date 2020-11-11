import React, {Component} from 'react';
import Routing            from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

export class Menu extends Component {
    constructor(props){
        super();

        this.state = {
            menu: JSON.parse(props.menu),
            active: 'dashboard'
        }
    }

    componentDidMount () {
        let tab = location.pathname.split("/");
        tab = tab.filter(elem => elem != "");

        tab.forEach(element => {
            this.state.menu.forEach(el => {
                if(element == el.name){
                    this.setState({active: element})
                }
            })
            
        });
    }

    render () {
        const {title, menuBottom, menuOpened, onCloseMenu} = this.props;
        const {menu, active} = this.state;

        let menuItems = menu.map((elem, index) => {
            return <a href={elem.path} className={(active == elem.name) ? "nav-item active" : "nav-item"} key={index}>
                <span className={"icon-" + elem.icon}></span>
                <span>{elem.label}</span>
            </a>
        })

        let menuBot = JSON.parse(menuBottom).map((elem, index) => {
            return <a href={elem.path} className="nav-item" key={index}>
                <span className={"icon-" + elem.icon}></span>
                <span>{elem.label}</span>
            </a>
        })

        return <nav className={menuOpened}>
            <div className="nav-header">
                <a href={title == "SuperAdmin" ? Routing.generate('super_dashboard') : Routing.generate('admin_dashboard')}><span>{title}</span></a>
                <span className="icon-cancel" onClick={onCloseMenu}></span>
            </div>
            <div className="nav-body">
                <div className="nav-items">
                    <div className="nav-items-top">
                        {menuItems}
                    </div>
                    <div className="nav-items-bottom">
                        {menuBot}
                    </div>
                </div>
            </div>
        </nav>
    }
}