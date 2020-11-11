import '../../css/pages/homepage.scss';

import React        from 'react';
import ReactDOM     from 'react-dom';

import {Newsletter} from './components/homepage/Newsletter';

import AOS from 'aos/dist/aos'

AOS.init();

let el = document.getElementById('newsletter');
if(el){
    ReactDOM.render(<Newsletter />, el)
}