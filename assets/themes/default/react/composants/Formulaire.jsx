import React from 'react';
import {Alert}            from './Alert';

export function Formulaire({onSubmit, inputs, success, error, btn, children}) {
    return ( 
        <form onSubmit={onSubmit}> 
            <div>
                <Alert type="success" message={success} active={success != "" ? true : false} />
                <Alert type="danger" message={error} active={error != "" ? true : false} />
            </div>
            <div>
                {inputs}
            </div>
            <div>
                {children}
            </div>
            <div>
                <button type="submit" className="btn btn-primary">{btn}</button>
            </div>
        </form> 
    );
}