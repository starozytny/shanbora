import '../../css/pages/agenda.scss';
import React              from 'react';
import ReactDOM           from 'react-dom';
import {Agenda}           from './composants/agenda/Agenda';

let el = document.getElementById("agenda");
if(el){
    ReactDOM.render(<Agenda week={el.dataset.week} today={el.dataset.today} events={el.dataset.events} />, el)
}