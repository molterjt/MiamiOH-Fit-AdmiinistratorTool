import React from 'react';
import { Query, Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import NavigationBar from './NavigationBar';
import Ionicon from 'react-ionicons';


const DELETE_COMMENT = gql`
    mutation deleteComment($id: ID!){
        deleteComment(id:$id){
            id
            content
        }
    }
`


const COMMENT_LIST = gql`
    query{
        allComments(orderBy:createdAt_DESC){
            id
            content
            userComment{username, email}
            classComment{title,instructor{firstName}}
            createdAt
        }
    }
`

/*******Delete Comment**********/
const RemoveComment = ({id}) => {
    return (
        <Mutation
            mutation={DELETE_COMMENT}
            refetchQueries={[COMMENT_LIST]}
        >
            {(deleteComment, {data}) => (

                <Ionicon icon="ios-trash" onClick={ e => {
                        if(window.confirm("Are you sure you want to DELETE?")){
                            deleteComment({
                                variables: {
                                    id
                                },
                                refetchQueries:[
                                    {query: COMMENT_LIST}
                                ]


                            });
                            console.log("Comment with id: " + id + " was deleted");
                        }

                    }} fontSize="35px" color="black"/>

            )}
        </Mutation>
    );
}

/*******Component CommentList**********/
class CommentList extends React.Component{
    render(){
        return(
            <Query query={COMMENT_LIST}>
                {({loading, error, data}) => {
                    if(loading) return "Loading...";
                    if(error) return `Errro! ${error.message}`;
                    return(
                        <div style={{alignItems:"center", justifyContent:"center"}}>
                            <NavigationBar/>
                            <div >
                                <table style={{margin: 10, padding: 20, border:'1px solid black', alignContent:"center", justifyContent: "center"}}>
                                    <tbody>
                                    <tr >
                                        <th className={"th"} >Comment:</th>
                                        <th className={"th"} >User:</th>
                                        <th className={"th"}>GF-Class:</th>
                                        <th className={"th"}>Instructor:</th>
                                        <th className={"th"}>Created_At:</th>
                                    </tr>
                                    {data.allComments.map(({content, userComment, id, classComment, createdAt}) => (
                                            <tr key={id}>
                                                <td className={"td"}>{content}</td>
                                                <td className={"td"}>{userComment.username}  {userComment.email}</td>
                                                {classComment!== null
                                                    ? (<td className={"td"}>{classComment.title}</td>)
                                                    : (<td className={"td"}>FindYourFit Request</td>)
                                                }
                                                {classComment!== null
                                                    ? (<td className={"td"}>{classComment.instructor.firstName}</td>)
                                                    : (<td className={"td"}>Class Instructor Was Deleted!</td>)
                                                }
                                                <td className={"td"}>{createdAt.toString().substring(0, 10)} {createdAt.substring(11,19)}</td>
                                                <td className={"td"}><RemoveComment id={id}/></td>
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


export default CommentList;
