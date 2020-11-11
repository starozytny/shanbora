import React, {Component} from 'react';

import Routing            from '@publicFolder/bundles/fosjsrouting/js/router.min.js';
import {Page}             from '@reactFolder/composants/page/Page';
import ActionsClassique   from '@reactFolder/functions/actions_classique';

export class NewsletterList extends Component {
    render () {
        const {demandes, onDelete} = this.props

        let items = <div className="alert alert-primary">Aucun enregistrement.</div>;

        if(demandes.length != 0){
            items = demandes.map(elem => {

                return <div className={"card-2"} key={elem.id}>
                    <div className="card-2-header">
                        {/* <div className="title">{elem.firstname}</div> */}
                        <div className="subtitle">{elem.email}</div>
                    </div>
                    <div className="card-2-footer">
                        {/* <div className="date">
                            <span>{elem.createAtString}</span>
                        </div> */}
                        <div className="actions">
                            <div className="item">
                                <div className="btn-icon" onClick={e => onDelete(elem.id)}>
                                    <span className="icon-trash"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            })
        }

        return <div className="cards-container">
            <div className="cards-items"> {items} </div>
        </div>
    }
}

export class Newsletter extends Component {
    constructor (props){
        super();

        let data = JSON.parse(props.demandes);
        let dataList = data.slice(0, 12);

        this.state = {
            dataImmuable: data,
            data: data,
            dataList: dataList,
            tailleList: data.length
        }

        this.handleUpdateList = this.handleUpdateList.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleUpdateList = (dataList) => { this.setState({ dataList: dataList }) }

    handleDelete = (id) => {
        ActionsClassique.classiqueDelete(this, Routing.generate('super_newsletter_delete', {'news': id}), id);
    }

    render (){
        const {data, dataList, tailleList} = this.state;

        let content = <div className="liste liste-rgpd">
            <NewsletterList demandes={dataList} onDelete={this.handleDelete} />
        </div>

        return <>
            <Page content={content} 
                havePagination="true" taille={tailleList} itemsPagination={data} perPage="12" onUpdate={this.handleUpdateList}
            />
        </>
    }
}