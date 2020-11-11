import React, {Component} from 'react';

import Calendrier         from '@reactFolder/functions/calendrier';
import {Page}             from '@reactFolder/composants/page/Page';

export class Agenda extends Component {
    constructor (props){
        super ()

        this.state = {
            daySelected: JSON.parse(props.today),
            week: JSON.parse(props.week),
            events: JSON.parse(props.events),
        }
    }
    render () {
        const {daySelected, week, events} = this.state

        let content = <div className="liste-agenda">
            <Week daySelected={daySelected} week={week} events={events}/>
        </div>

        return <>
            <Page content={content} />
        </>
    }
}

export class Week extends Component {
    render () {
        const {daySelected, week, events} = this.props

        // HEADER --- 7 jours
        let header = week.map((el, index) => {
            return <div className={"agenda-item" + (daySelected.wday == el.wday ? " active" : "")} key={index}>
                <div className="label">
                    <div className="label-desktop">{Calendrier.getDayFr(el.wday)}</div>
                    <div className="label-mobile">{Calendrier.getShortDayFr(el.wday)}</div>
                </div>
                <div className="number">{el.mday}</div>
            </div>
        })

        // TIME --- de 6h à 00h
        let timeCalendar = Calendrier.getTimeCalendar(6,23);
        let timeSlots = timeCalendar.map((el, index) => {
            return <div key={index} className="agenda-hours">
                <div className="label">{el}</div>
            </div>
        })

        // EVENTS --- 
        let eventSlots = week.map((elemDay, index) => {

            let slots = []
            timeCalendar.forEach((elemTime, index) => {   

                let evenements =  []
                events.forEach((el, index) => {
                    if(el.startAtDayNumberWeek == elemDay.wday && el.startAtTimeString == elemTime){

                        // EVENTS --- Avatars
                        let avatars = []
                        el.users.forEach((user, index) => {
                            avatars.push(<div key={user.id} className="avatar">
                                <img src={"../../uploads/" + user.avatar} alt="avatar"/>
                            </div>)
                        })

                        let name = el.name
                        if(name.length > 5){
                            name = name.substring(0, 13) + '...'
                        }
                        
                        // EVENTS --- Cards
                        evenements.push(<div key={el.id} className="event">
                            <div className="event-color event-color-"></div>
                            <div className="event-infos">
                                <div className="event-name">{name}</div>
                                <div className="event-avatars">{avatars}</div>
                            </div>
                            <div className="event-when">
                                <div className="event-time">{el.startAtTimeString}</div>
                            </div>
                        </div>)
                    }               
                })    
                
                // EVENTS --- Add event to slot
                slots.push(<div key={index} className={"agenda-slot agenda-slot-fillWith-" + evenements.length}>
                    <div className="agenda-events">
                        {evenements.length != 0 ? evenements : null}
                    </div>
                </div>)
            })

            return <div key={index} className="agenda-slots">
                {slots}
            </div>
        })

        return <div className="agenda-table">
            <div className="agenda-table-header">
                {header}
            </div>
            <div className="agenda-table-body">
                <div className="agenda-table-times">
                    {timeSlots}
                </div>
                <div className="agenda-table-slots">
                    {eventSlots}
                </div>
            </div>
        </div>
    }
}

