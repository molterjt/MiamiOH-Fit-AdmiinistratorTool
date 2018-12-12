import React from 'react';
import {Query, Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import NavigationBar from './NavigationBar';
import moment from 'moment';
import Ionicon from 'react-ionicons';


const USER_CHECKINS = gql`
    query{
        allUsers(orderBy: username_ASC){
            username
            email
            _checkinsMeta{count}
            checkins(filter:{classes_some: {title_gte: " "}}, orderBy: createdAt_DESC){
                classes{
                    title,instructor{firstName},
                    location{facilityName}
                }
                checked
                createdAt
            }
        }
    }
`

const ALL_CHECKINS = gql`
    query{
        allCheckins{
            id
            events{name, _checkinsMeta{count}}
            classes{title, _checkinsMeta{count}}
            workouts{title, _checkinsMeta{count}}
        }
    }
`


class AllCheckinList extends React.Component{
    constructor(props){
        super(props);
        this.state={};
    }
    render(){
        return(
            <Query query={ALL_CHECKINS}>
                {({loading, error, data}) => {
                    if (loading) return "Loading...";
                    if (error) return `Error! ${error.message}`;
                    return (
                        <div>
                            <table style={{margin: 10, padding: 20, border:'1px solid black', textAlign:'center',}}>
                                <tbody>
                                <tr>
                                    <th className={'th'}>Events</th>
                                    <th className={'th'}>Event-Checkins:</th>
                                    <th className={'th'}>Classes:</th>
                                    <th className={'th'}>Class-Checkins:</th>
                                    <th className={'th'}>Workouts:</th>
                                    <th className={'th'}>Workout-Checkins:</th>
                                </tr>

                                </tbody>

                            </table>
                        </div>
                    );
                }}
            </Query>
        );
    }
}


class UserCheckInList extends React.Component{
    constructor(props){
        super(props);
        this.state={

        };
    }
    render(){
        return(
            <Query query={USER_CHECKINS}>
                {({loading, error, data}) => {
                    if(loading) return "Loading...";
                    if(error) return `Error! ${error.message}`;
                    return(
                        <div>
                            <NavigationBar/>
                            <div>
                                <AllCheckinList/>
                                <table style={{margin: 10, padding: 20, border:'1px solid black', textAlign:'center',}}>
                                    <tbody>
                                    <tr>
                                        <th className={'th'}>User:</th>
                                        <th className={'th'}>Email:</th>
                                        <th className={'th'}>CheckIns:</th>
                                        <th className={'th'}>Class Detail:</th>
                                    </tr>
                                    {data.allUsers.map(({id, email, username, _checkinsMeta, checkins }) => (
                                            <tr key={id}>
                                                <td style={{ border:'1px solid black',  width: 500, }}>{username}</td>
                                                <td style={{ border:'1px solid black',  min_width: 360, }}>{email}</td>
                                                <td style={{ border:'1px solid black',  width: 100, }}>{_checkinsMeta.count}</td>
                                                {checkins.map(({classes, createdAt}) => (
                                                    <td style={{ border:'1px solid black',  width: 800, }}>
                                                        <p style={{ border:'1px solid black'}}>{moment(createdAt).format('M/D/Y')}<br/>{moment(createdAt).format('h:mm a')}</p>
                                                        {classes.map(({title, instructor, location}) => (
                                                           <div style={{width: 160}}>
                                                            <h5>{title}</h5>
                                                            <p >{instructor.firstName}</p>
                                                            <p >{location.facilityName}</p>
                                                           </div>


                                                    ))}
                                                    </td>
                                                ))}

                                            </tr>
                                        )
                                    )}
                                    </tbody>

                                </table>
                            </div>

                        </div>

                    );
                }}
            </Query>
        );;
    }
}

export default UserCheckInList;