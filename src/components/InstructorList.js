import React from 'react';
import {graphql, Query, Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import NavigationBar from './NavigationBar';
import moment from 'moment';
import Ionicon from 'react-ionicons'
import axios from "axios/index";
import Modal from "react-modal";


const album_id = 'eC6uYgn';
const Imgur_Client_Id = '06e18547aec23a5';

const DELETE_INSTRUCTOR = gql`
    mutation deleteInstructor($id: ID!){
        deleteInstructor(id: $id){
            id
        }
    }
`

const INSTRUCTOR_LIST=gql`
    query{
        allInstructors(orderBy: lastName_ASC){
            id
            firstName
            lastName
            email
            classes{title, isPublished, category{title}}
            alsoTrainer{workouts{title}}
            imageUrl
            isTrainer
            createdAt
            updatedAt
            description
            _classesMeta{count}
        }
    }
`

const SINGLE_INSTRUCTOR = gql`
    query($id:ID!){
        Instructor(id: $id){
            id
            firstName
            lastName
            email
            description
            imageUrl
        }
    }
    
`

const UPDATE_INSTRUCTOR = gql`
    mutation($id: ID!, $firstName: String, $lastName: String, $email: String, $description: String, $imageUrl: String){
        updateInstructor(id: $id, firstName: $firstName, lastName: $lastName, email: $email, description: $description, imageUrl: $imageUrl ){
            id,
            firstName
            lastName
            email
            description
            imageUrl
        }
    }
`

const CREATE_INSTRUCTOR = gql`
    mutation($firstName: String, $lastName: String, $email: String, $description: String, $imageUrl: String){
        createInstructor(firstName: $firstName, lastName: $lastName, email: $email, description: $description, imageUrl: $imageUrl){
            id
            firstName
            lastName
            email
            description
            imageUrl
        }
    }
`

/*******Delete Instructor**********/
const RemoveInstructor = ({id, firstName}) => {
    return (
        <Mutation
            mutation={DELETE_INSTRUCTOR}
        >
            {(deleteInstructor, {data}) => (

                <Ionicon icon="ios-trash" onClick={ () => {
                    if(window.confirm("Are you really, really sure you want to DELETE " + `${firstName}` +"?" +
                            " There's no take backs! Make sure all active classes have been reassigned")){
                        deleteInstructor({
                            variables: {
                                id
                            },
                            refetchQueries: [ { query: INSTRUCTOR_LIST }],
                        });
                        alert(`${firstName}`+ " with id: " + id + " was deleted");
                    }
                }} fontSize="35px" color="black"/>
            )}
        </Mutation>
    );
}
/*******Update Instructor**********/

class UpdateInstructor extends React.Component{
    constructor(props){
        super(props);

        this.state={
            firstName: undefined,
            lastName: undefined,
            email: undefined,
            description: undefined,
            imageUrl: undefined,
            gallery: [],

        };
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this._handleInstructorUpdateSubmit=this._handleInstructorUpdateSubmit.bind(this);

    }
    openModal() {
        this.setState({modalIsOpen: true});
    }
    closeModal() {
        this.setState({modalIsOpen: false});
    }
    componentWillMount() {
        Modal.setAppElement('body');
    }
    componentDidMount() {
        axios({
            method: 'get',
            url: 'https://api.imgur.com/3/album/' + album_id + '/images',
            headers: {'authorization': 'Client-ID ' + Imgur_Client_Id}
        })
            .then(res => {
                console.log(res.data);
                console.log(res.data.success);
                console.log(res.data.data);
                this.setState({gallery: res.data.data});
            })
            .catch(error => console.log(error));
    }
    _handleInstructorUpdateSubmit = async (id) => {
        try{
            await this.props.mutate({
                variables:{
                    id: id,
                    firstName: this.state.firstName,
                    lastName: this.state.lastName,
                    email: this.state.email,
                    description: this.state.description,
                    imageUrl: this.state.imageUrl,
                },
                refetchQueries:[
                    {query: INSTRUCTOR_LIST}
                ]
            })
        } catch (e) {
            console.log(e.message)
        }
    };

    render(){
        return(
            <div>
                <div className={"justify-center alignItems-center"}>
                    <Ionicon icon="md-build" onClick={() => this.openModal()} fontSize="35px" color="gray"/>
                </div>
                <div>
                    <Query query={SINGLE_INSTRUCTOR} variables={{id: this.props.id}}>
                        {({loading, error, data}) => {
                            if (loading) return "Loading...";
                            if (error) return `Errro! ${error.message}`;
                            return (
                                <div>

                                    <div style={{ justifyContent:'center', textAlign:'center', alignContent:'center'}}>
                                        <Modal isOpen={this.state.modalIsOpen} onRequestClose={this.closeModal}>
                                            <div className={"pull-right"}>
                                                <Ionicon
                                                    icon="ios-close-circle-outline"
                                                    onClick={this.closeModal}
                                                    fontSize="45px"
                                                    color="blue"
                                                />
                                            </div>
                                            <h1>Update</h1>
                                            <form
                                                style={{textAlign: 'center', marginTop: 70}}
                                                onSubmit={ async(e) => {
                                                    e.preventDefault();
                                                    await this._handleInstructorUpdateSubmit(data.Instructor.id);
                                                    this.closeModal();
                                                }}
                                            >
                                                <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', border: '1px solid gray' }}>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "30%", height: 180, padding:10, border: '1px solid gray' }}>
                                                        <label>First Name:</label>
                                                        <br/>
                                                        <input
                                                            style={{width: 240, paddingLeft: 10}}
                                                            name={'title'}
                                                            value={this.state.firstName}
                                                            placeholder={data.Instructor.firstName}
                                                            onChange={ (e) => this.setState({firstName: e.target.value})}
                                                        />
                                                    </div>

                                                    <div style={{backgroundColor: "#c2d9c3", width: "30%", height: 180, padding:10, border: '1px solid gray'  }}>
                                                        <label>Last Name:</label>
                                                        <br/>
                                                        <input
                                                            style={{width: 240, paddingLeft: 10}}
                                                            value ={this.state.lastName}
                                                            placeholder = {data.Instructor.lastName}
                                                            onChange = {(e) => this.setState({lastName: e.target.value})}
                                                        />
                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "40%", height: 180, padding:10, border: '1px solid gray' }}>
                                                        <label>Current Image:</label>
                                                        <br/>
                                                        <img
                                                            src={data.Instructor.imageUrl}
                                                            width={130}
                                                            alt={"GroupFitClass"}
                                                            style={{marginRight: 10, marginBottom: 10}}
                                                        />
                                                        <select
                                                            name={"imageList"}
                                                            value={this.state.imageUrl}
                                                            onChange={(e) => this.setState({imageUrl: e.target.value})}
                                                            className={"form-select"}
                                                        >
                                                            <option style={{marginLeft: 10}}>Select New Image</option>
                                                            {this.state.gallery.map((obj) => (
                                                                <option key={obj.id} value={obj.link}>
                                                                    {obj.title}
                                                                </option>
                                                            ))}
                                                        </select>

                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "100%", height: 180, padding:10, border: '1px solid gray' }}>
                                                        <label style={{textAlign: 'center', marginRight: 20}}>Description:</label>
                                                        <br/>
                                                        <textarea
                                                            style={{width: 600, padding:10}}
                                                            rows={5}
                                                            placeholder={data.Instructor.description}
                                                            value={this.state.description}
                                                            onChange={(e) => this.setState({description: e.target.value})}
                                                        />
                                                    </div>

                                                </div>
                                                <br />
                                                <button
                                                    title={"Submit"}
                                                    type={"submit"}
                                                    className={"btn btn-danger btn-lg active"}
                                                    style={{marginTop: 10, boxShadow: 3}}
                                                >Submit
                                                </button>
                                            </form>
                                        </Modal>
                                    </div>
                                </div>
                            );
                        }}
                    </Query>
                </div>
            </div>
        );
    }
}

const UpdateTheInstructor = graphql(UPDATE_INSTRUCTOR, {options: { fetchPolicy: 'network-only' }})(UpdateInstructor);

/*******Create Instructor**********/

class CreateInstructor extends React.Component{
    constructor(props){
        super(props);
        this.state={
            firstName: undefined,
            lastName: undefined,
            email: undefined,
            description: undefined,
            imageUrl: undefined,
            isTrainer: false,
            gallery: [],
        };
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this._handleCreateInstructorSubmit=this._handleCreateInstructorSubmit.bind(this);
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }
    closeModal() {
        this.setState({modalIsOpen: false});
    }
    componentWillMount() {
        Modal.setAppElement('body');
    }
    componentDidMount() {
        axios({
            method: 'get',
            url: 'https://api.imgur.com/3/album/' + album_id + '/images',
            headers: {'authorization': 'Client-ID ' + Imgur_Client_Id}
        })
            .then(res => {
                console.log(res.data);
                console.log(res.data.success);
                console.log(res.data.data);
                this.setState({gallery: res.data.data});
            })
            .catch(error => console.log(error));
    }


    _handleCreateInstructorSubmit = async () => {

        await this.props.mutate({
            variables:{
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                email: this.state.email,
                description: this.state.description,
                imageUrl: this.state.imageUrl,
            },
            refetchQueries:[
                {query: INSTRUCTOR_LIST}
            ]
        })
    };

    render(){
        return(
            <div>
                <button
                    onClick={() => this.openModal()}
                    className={"btn btn-success pull-right "}
                    style={{fontWeight: 700, padding: 5, border: "2px solid #000000", textAlign: "center", marginTop: 25, marginLeft: 15}}
                >Create +</button>
                <div style={{ justifyContent:'center', textAlign:'center', alignContent:'center'}}>
                    <Modal isOpen={this.state.modalIsOpen} onRequestClose={this.closeModal}>
                        <div className={"pull-right"}>
                            <Ionicon
                                icon="ios-close-circle-outline"
                                onClick={this.closeModal}
                                fontSize="45px"
                                color="blue"
                            />
                        </div>
                        <h2>Create Instructor</h2>
                        <form
                            style={{textAlign: 'center', marginTop: 70}}
                            onSubmit={ async(e) => {
                                e.preventDefault();
                                await this._handleCreateInstructorSubmit();
                                this.closeModal();
                            }}
                        >
                            <div style={{justifyContent:'center', textAlign:'center', alignContent:'center',backgroundColor: "#f7f9dd", padding:15, marginBottom: 20, }}>
                                <div style={{backgroundColor: "#f7f9dd", display: 'flex' ,flex: 1, textAlign:'center', justifyContent:'center', flexAlign: 'center', alignItems: 'center'}}>
                                    <div style={{position: 'center', display: "flex", flexDirection: "row", marginRight: 30, textAlign:'center', justifyContent:'center', flexAlign: 'center', alignItems: 'center'}}>
                                        <label  style={{marginRight: 15, }}>First Name:</label>
                                        <br/>
                                        <input
                                            style={{width: 240, textAlign: 'center'}}
                                            name={'title'}
                                            value={this.state.firstName}
                                            placeholder={"first name"}
                                            onChange={ (e) => this.setState({firstName: e.target.value})}
                                        />
                                    </div>

                                    <div style={{backgroundColor: "#f7f9dd", display: "flex", flexDirection: "row", marginRight: 30, textAlign:'center', justifyContent:'center', flexAlign: 'center', alignContent:'center', alignItems: 'center'}}>
                                        <label  style={{marginRight: 15, }}>Last Name:</label>
                                        <br/>
                                        <input
                                            style={{width: 240, textAlign: 'center'}}
                                            value ={this.state.displayTime}
                                            placeholder = {"last name"}
                                            onChange = {(e) => this.setState({lastName: e.target.value})}
                                        />
                                    </div>
                                    <div style={{backgroundColor: "#f7f9dd",display: "flex", flexDirection: "row", marginRight: 30, textAlign:'center', justifyContent:'center', flexAlign: 'center', alignContent:'center', alignItems: 'center'}}>
                                        <label  style={{marginRight: 15, }}>Email:</label>
                                        <br/>
                                        <input
                                            style={{width: 240, textAlign: 'center'}}
                                            value ={this.state.email}
                                            placeholder = {"email"}
                                            onChange = {(e) => this.setState({email: e.target.value})}
                                        />
                                    </div>
                                </div>
                                    <div style={{backgroundColor: "#f7f9dd", marginTop: 30, marginBottom:30}}>
                                        <label style={{marginLeft: 25, marginRight: 15, }}>Image:</label>
                                        <select
                                            name={"imageList"}
                                            value={this.state.imageUrl}
                                            onChange={(e) => this.setState({imageUrl: e.target.value})}
                                            className={"form-select"}
                                        >
                                            <option style={{marginLeft: 10}}>Select New Image</option>
                                            {this.state.gallery.map((obj) => (
                                                <option key={obj.id} value={obj.link}>
                                                    {obj.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{backgroundColor: "#f7f9dd", marginBottom: 30}}>
                                        <label style={{textAlign: 'center', marginRight: 15, }}>Description:</label>
                                        <br/>
                                        <textarea
                                            style={{width: 600}}
                                            rows={3}
                                            placeholder={" Description"}
                                            value={this.state.description}
                                            onChange={(e) => this.setState({description: e.target.value})}
                                        />
                                    </div>
                            </div>


                            <button
                                title={"Submit"}
                                type={"submit"}
                                className={"btn btn-danger btn-lg active boxShadow-emboss"}
                                style={{marginTop: 10, boxShadow: 3}}
                            >Submit
                            </button>
                        </form>

                    </Modal>
                </div>
            </div>

        );
    }
}

const CreateTheInstructor = graphql(CREATE_INSTRUCTOR, {options: { fetchPolicy: 'network-only' }})(CreateInstructor);

/*******Component Instructor**********/

class InstructorList extends React.Component{
    render(){
        return(
            <Query query={INSTRUCTOR_LIST}>
                {({loading, error, data}) => {
                    if(loading) return "Loading...";
                    if(error) return `Errro! ${error.message}`;
                    return(
                        <div>
                            <NavigationBar/>
                            <div style={{display:'flex', flexDirection:'row'}}>
                                <h2 style={{marginLeft: 20}}>Instructor:</h2>
                                <CreateTheInstructor />
                            </div>
                            <div style={{width:"95%", alignItems:'center', marginLeft: 20, marginBottom: 50}} >
                                <table style={{border:'1px solid black', }}>
                                    <tbody style={{textAlign: 'center', fontSize:12}}>
                                    <tr >
                                        <th className={"th"} >Image:</th>
                                        <th className={"th"}>Name:</th>
                                        <th className={"th"}>Email:</th>
                                        <th className={"th"}>Description:</th>
                                        <th className={"th"}>Created/Updated:</th>
                                        <th className={"th"}>Class Count:</th>
                                        <th className={"th"}>ClassList:</th>
                                        <th className={"th"}>Trainer?</th>
                                        <th className={"th"}>TrainerWorkouts:</th>

                                    </tr>
                                    {data.allInstructors.map(({id, firstName, lastName, email, description, createdAt, updatedAt,
                                                                  classes, instructorId, alsoTrainer, imageUrl, isTrainer, _classesMeta}) => (
                                            <tr key={id}>
                                                <td style={{ border:'2px solid black',  width: 150, }}><img style={{height: undefined, width: 'auto'}} src={imageUrl} alt={firstName} /></td>
                                                <td style={{ border:'2px solid black', minWidth: 50, }}>{firstName} {lastName}</td>

                                                <td style={{ border:'1px solid black',  width: 100, padding: 3  }}>{email}</td>
                                                <td style={{ border:'1px solid black',  minWidth: 200,}}>{description}</td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:1}}>c: {moment(createdAt).format("M/D/Y")}<br/>u: {moment(updatedAt).format("M/D/Y")}</td>
                                                <td style={{ border:'1px solid black',  width: 30, }}>{_classesMeta.count}</td>
                                                <td style={{ border:'1px solid black',  width: 150, }}>
                                                    {classes.map(({title }, index) => (
                                                        <label key={index} style={{ border:'1px solid gray',  width: "100%", fontSize:11,}}>{title}</label>

                                                    ))}
                                                </td>
                                                <td style={{ border:'1px solid black',  maxWidth: 30, }}>{isTrainer.toString()}</td>
                                                <td style={{ border:'1px solid black',  width: 150, }}>
                                                    {alsoTrainer.map(({workouts}, index) => (
                                                        <div key={index} style={{width: 200, }}>{workouts.map(({title}) => title).join(';  ')}</div>
                                                    ))}
                                                </td>

                                                <td style={{ border:'1px solid black',  width: 70, }}><RemoveInstructor id={id} firstName={firstName}/></td>
                                                <td style={{ border:'1px solid black',  width: 70, }}><UpdateTheInstructor id={id}/></td>

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

export default InstructorList;

