import React from 'react';
import {Query, Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import NavigationBar from './NavigationBar';
import moment from 'moment';
import Ionicon from 'react-ionicons';


const DELETE_USER = gql`
    mutation deleteUser($id: ID!){
        deleteUser(id:$id){
            id
        }
    }
`


const USER_LIST = gql`
    query{
        allUsers(orderBy:createdAt_DESC){
            email
            id
            username
            createdAt
            _commentsMeta{count}
        }
    }
`
/*******Delete User from UserList**********/
const RemoveUser = ({id, username}) => {
    return (
        <Mutation
            mutation={DELETE_USER}
        >
            {(deleteUser, {data}) => (
                <Ionicon icon="ios-trash" onClick={ () => {
                    if(window.confirm('Are you really, really sure you want to DELETE ' + `${username}` +'? There are no take backs!')){
                        deleteUser({
                            variables: {
                                id
                            },
                            refetchQueries: [ { query: USER_LIST }],
                        });
                        alert(`${username}` + " with id: " + id + " was deleted");
                    }
                }} fontSize="35px" color="black"/>
            )}
        </Mutation>
    );
}
/*******Component UserList**********/

class UserLIst extends React.Component{
    render(){
        return(
            <Query query={USER_LIST}>
                {({loading, error, data}) => {
                    if(loading) return "Loading...";
                    if(error) return `Error! ${error.message}`;
                    return(
                        <div>

                            <NavigationBar/>
                            <div >
                                <table style={{margin: 10, padding: 20, border:'1px solid black', textAlign:'center',}}>
                                    <tbody>
                                    <tr>
                                        <th className={'th'}>User:</th>
                                        <th className={'th'}>Email:</th>
                                        <th className={'th'}>Created_At:</th>
                                        <th className={'th'}>CommentCount:</th>
                                    </tr>
                                    {data.allUsers.map(({id, email, username, createdAt, _commentsMeta }) => (
                                            <tr key={id}>

                                                <td style={{ border:'1px solid black',  width: 200, }}>{username}</td>
                                                <td style={{ border:'1px solid black',  width: 250, }}>{email}</td>
                                                <td style={{ border:'1px solid black',  width: 100, }}>
                                                    {moment(createdAt).format('M/D/Y')}<br/>{moment(createdAt).format('h:mm a')}
                                                </td>
                                                <td style={{ border:'1px solid black',  width: 150, }}>{_commentsMeta.count}</td>
                                                <td style={{ border:'1px solid black',  width: 100, }}><RemoveUser id={id} username={username}/></td>
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


export default UserLIst;