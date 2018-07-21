import React from 'react';
import { Query, Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import NavigationBar from './NavigationBar';
import moment from 'moment';
import Ionicon from 'react-ionicons';

const DELETE_TRAINER = gql`
    mutation deleteTrainer($id: ID!){
        deleteTrainer(id: $id){
            id
        }
    }
`

const TRAINER_LIST=gql`
    query{
        allTrainers{
            id
            firstName
            lastName
            email
            alsoInstructor{classes{title}}
            description
            imageUrl
            createdAt
            workouts{title}
            _workoutsMeta{count}
        }
    }
`
/*******Delete Trainer**********/
const RemoveTrainer = ({id, firstName}) => {
    return (
        <Mutation
            mutation={DELETE_TRAINER}
        >
            {(deleteTrainer, {data}) => (
                <Ionicon icon="ios-trash" onClick={ () => {
                if(window.confirm("Are you really, really sure you want to DELETE " + `${firstName}` +"?" +
                        " There's no take backs!")){
                    deleteTrainer({
                        variables: {
                            id
                        },
                        refetchQueries: [ { query: TRAINER_LIST }],
                    });
                    alert(`${firstName}`+ " with id: " + id + " was deleted");
                }
            }} fontSize="35px" color="black"/>
            )}
        </Mutation>
    );
}
/*******Component Trainer**********/

class TrainerList extends React.Component{
    render(){
        return(
            <Query query={TRAINER_LIST}>
                {({loading, error, data}) => {
                    if(loading) return "Loading...";
                    if(error) return `Errro! ${error.message}`;
                    return(
                        <div style={{alignItems:"center", justifyContent:"center"}}>
                            <NavigationBar/>
                            <h1>Trainer:</h1>
                            <div >
                                <table style={{margin: 10, padding: 20, border:'1px solid black', alignContent:"center", textAlign: "center"}}>
                                    <tbody>
                                    <tr >
                                        <th className={'th'}>Image:</th>
                                        <th className={'th'}>FirstName:</th>
                                        <th className={'th'}>LastName:</th>
                                        <th className={'th'}>Email:</th>
                                        <th className={'th'}>Description:</th>
                                        <th className={'th'}>Created_At:</th>
                                        <th className={'th'}> Workout_Count:</th>
                                        <th className={'th'}>ClassList:</th>
                                        <th className={'th'}>TrainerWorkouts:</th>

                                    </tr>
                                    {data.allTrainers.map(({id, firstName, lastName, email, description, createdAt,
                                                                 workouts, alsoInstructor , imageUrl, _workoutsMeta}) => (
                                            <tr key={id}>
                                                <td style={{ border:'2px solid black',  width: 100, }}><img style={{height: 100, width: 'auto'}} src={imageUrl} alt={firstName} /></td>
                                                <td style={{ border:'2px solid black', width: 70, padding:1 }}>{firstName}</td>
                                                <td style={{ border:'1px solid black',  width: 80, padding:1 }}>{lastName}</td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:2}}>{email}</td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:1}}>{description}</td>
                                                <td style={{ border:'1px solid black',  width: 100,padding:1 }}>{moment(createdAt).format('M/D/Y')}</td>
                                                <td style={{ border:'1px solid black',  width: 30, padding:1 }}>{_workoutsMeta.count}</td>
                                                <td style={{ border:'1px solid black',  width: 200, padding:1 }}>
                                                    {alsoInstructor.map(({classes}, index) => (
                                                        <p key={index}>{classes.map(({title}) => title).join("; ")}</p>
                                                    ))}
                                                </td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:1 }}>
                                                    <p style={{width: 200, }}>{workouts.map(({title}) => title).join("; ") + "\n"} </p>
                                                </td>
                                                <td style={{ border:'1px solid black',  width: 70, padding:1 }}>
                                                    <RemoveTrainer id={id} firstName={firstName}/>
                                                </td>
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
        );
    }
}

export default TrainerList;

