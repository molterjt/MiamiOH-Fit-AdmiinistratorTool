import React from 'react';
import { Query, Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import NavigationBar from './NavigationBar';
import moment from 'moment';
import Ionicon from 'react-ionicons';
import axios from "axios/index";
import {graphql} from "react-apollo/index";
import Modal from "react-modal";

const album_id = 'eC6uYgn';
const Imgur_Client_Id = '06e18547aec23a5';

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
            certification
            blurb
            alsoInstructor{id, classes{title}}
            description
            imageUrl
            createdAt
            updatedAt
            workouts{title}
        }
    }
`

const SINGLE_TRAINER = gql`
    query($id:ID!){
        Trainer(id: $id){
            id
            firstName
            lastName
            email
            certification
            blurb
            description
            imageUrl
            alsoInstructor{id}
            
        }
        allInstructors(orderBy: firstName_ASC){id, firstName, lastName}
    }

`

const UPDATE_TRAINER = gql`
    mutation($id: ID!, $firstName: String, $lastName: String, $alsoInstructorId: [ID!], $email: String, $certification: String, $blurb: String, $description: String, $imageUrl: String){
        updateTrainer(id: $id, firstName: $firstName, lastName: $lastName, alsoInstructorIds: $alsoInstructorId, email: $email, certification:$certification, blurb:$blurb, description: $description, imageUrl: $imageUrl ){
            id
            firstName
            lastName
            email
            certification
            blurb
            description
            imageUrl
            
        }
    }
`

const CREATE_TRAINER = gql`
    mutation($firstName: String, $lastName: String, $email: String, $certification: String, $blurb: String, $description: String, $imageUrl: String){
        createTrainer(firstName: $firstName, lastName: $lastName, certification: $certification, blurb:$blurb, email: $email, description: $description, imageUrl: $imageUrl){
            id
            firstName
            lastName
            email
            certification
            blurb
            description
            imageUrl
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

/*******Update Trainer**********/

class UpdateTrainer extends React.Component{
    constructor(props){
        super(props);

        this.state={
            firstName: undefined,
            lastName: undefined,
            email: undefined,
            certification: undefined,
            blurb: undefined,
            description: undefined,
            imageUrl: undefined,
            alsoInstructorId: [],
            gallery: [],


        };
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this._handleTrainerUpdateSubmit=this._handleTrainerUpdateSubmit.bind(this);
        this._handleAlsoInstructorId = this._handleAlsoInstructorId.bind(this);

    }
    _handleAlsoInstructorId(e){
        let newSelection = e.target.value;
        let newMatchList;

        if(this.state.alsoInstructorId.indexOf(newSelection) > -1){
            newMatchList = this.state.alsoInstructorId.filter(s => s !== newSelection)
        } else {
            newMatchList = [...this.state.alsoInstructorId, newSelection];
        }
        this.setState({alsoInstructorId: newMatchList}, () => console.log('instructor selection', this.state.alsoInstructorId));
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
    _handleTrainerUpdateSubmit = async (id) => {
        try{
            await this.props.mutate({
                variables:{
                    id: id,
                    firstName: this.state.firstName,
                    lastName: this.state.lastName,
                    email: this.state.email,
                    certification: this.state.certification,
                    blurb: this.state.blurb,
                    description: this.state.description,
                    imageUrl: this.state.imageUrl,
                    alsoInstructorId: this.state.alsoInstructorId,
                },
                refetchQueries:[
                    {query: TRAINER_LIST}
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
                    <Query query={SINGLE_TRAINER} variables={{id: this.props.id}}>
                        {({loading, error, data}) => {
                            if (loading) return "Loading...";
                            if (error) return `Errro! ${error.message}`;
                            const instructorList = data.allInstructors;
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
                                            <h1>Update Trainer</h1>
                                            <form
                                                style={{textAlign: 'center', marginTop: 70}}
                                                onSubmit={ async(e) => {
                                                    e.preventDefault();
                                                    await this._handleTrainerUpdateSubmit(data.Trainer.id);
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
                                                            placeholder={data.Trainer.firstName}
                                                            onChange={ (e) => this.setState({firstName: e.target.value})}
                                                        />
                                                        <br/>
                                                        <br/>
                                                        <label>Last Name:</label>
                                                        <br/>
                                                        <input
                                                            style={{width: 240, paddingLeft: 10}}
                                                            value ={this.state.lastName}
                                                            placeholder = {data.Trainer.lastName}
                                                            onChange = {(e) => this.setState({lastName: e.target.value})}
                                                        />
                                                    </div>

                                                    <div style={{backgroundColor: "#c2d9c3", width: "30%", height: 180, padding:10, border: '1px solid gray'  }}>
                                                        <label>Email:</label>
                                                        <br/>
                                                        <input
                                                            style={{width: 240, paddingLeft: 10}}
                                                            value ={this.state.email}
                                                            placeholder = {data.Trainer.email}
                                                            onChange = {(e) => this.setState({email: e.target.value})}
                                                        />
                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "40%", height: 180, padding:10, border: '1px solid gray' }}>
                                                        <label>Current Image:</label>
                                                        <br/>
                                                        <img
                                                            src={data.Trainer.imageUrl}
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
                                                    <div style={{backgroundColor: "#c2d9c3", width: "50%", height: 180, padding:10, border: '1px solid gray' }}>
                                                        <label style={{textAlign: 'center', marginRight: 20}}>Certification:</label>
                                                        <br/>
                                                        <textarea
                                                            style={{width: "90%", padding:10}}
                                                            rows={5}
                                                            placeholder={data.Trainer.certification}
                                                            value={this.state.certification}
                                                            onChange={(e) => this.setState({certification: e.target.value})}
                                                        />
                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "50%", height: 180, padding:10, border: '1px solid gray' }}>
                                                        <label style={{textAlign: 'center', marginRight: 20}}>Blurb:</label>
                                                        <br/>
                                                        <textarea
                                                            style={{width: "90%", padding:10}}
                                                            rows={5}
                                                            placeholder={data.Trainer.blurb}
                                                            value={this.state.blurb}
                                                            onChange={(e) => this.setState({blurb: e.target.value})}
                                                        />
                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "70%", height: 180, padding:10, border: '1px solid gray' }}>
                                                        <label style={{textAlign: 'center', marginRight: 20}}>Description:</label>
                                                        <br/>
                                                        <textarea
                                                            style={{width: "90%", padding:10}}
                                                            rows={5}
                                                            placeholder={data.Trainer.description}
                                                            value={this.state.description}
                                                            onChange={(e) => this.setState({description: e.target.value})}
                                                        />
                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "30%", height: 180, padding:10, border: '1px solid gray' }}>
                                                        <label style={{textAlign: 'center', marginRight: 20}}>If also instructor:</label>
                                                        <br/>
                                                        <select
                                                            name={"alsoInstructor"}
                                                            value={this.state.alsoInstructorId}
                                                            onChange={this._handleAlsoInstructorId}
                                                            className={"form-select"}
                                                        >

                                                            <option>'Match to Instructor'</option>

                                                            {instructorList.map((obj) =>
                                                                <option
                                                                    key={obj.id}
                                                                    value={obj.id}
                                                                >
                                                                    {obj.firstName + " " + obj.lastName}
                                                                </option>

                                                            )}
                                                        </select>
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

const UpdateTheTrainer = graphql(UPDATE_TRAINER, {options: { fetchPolicy: 'network-only' }})(UpdateTrainer);

/*******Create Trainer**********/

class CreateTrainer extends React.Component{
    constructor(props){
        super(props);
        this.state={
            firstName: undefined,
            lastName: undefined,
            email: undefined,
            certification: undefined,
            blurb: undefined,
            description: undefined,
            imageUrl: undefined,
            isTrainer: false,
            gallery: [],
        };
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this._handleCreateTrainerSubmit=this._handleCreateTrainerSubmit.bind(this);
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


    _handleCreateTrainerSubmit = async () => {

        await this.props.mutate({
            variables:{
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                email: this.state.email,
                certification: this.state.certification,
                blurb: this.state.blurb,
                description: this.state.description,
                imageUrl: this.state.imageUrl,
            },
            refetchQueries:[
                {query: TRAINER_LIST}
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
                        <h2>Create Trainer</h2>
                        <form
                            style={{textAlign: 'center', marginTop: 70}}
                            onSubmit={ async(e) => {
                                e.preventDefault();
                                await this._handleCreateTrainerSubmit();
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
                                            value ={this.state.lastName}
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
                                    <label style={{textAlign: 'center', marginRight: 15, }}>Certification:</label>
                                    <br/>
                                    <textarea
                                        style={{width: 600}}
                                        rows={3}
                                        placeholder={"Certification"}
                                        value={this.state.certification}
                                        onChange={(e) => this.setState({certification: e.target.value})}
                                    />
                                </div>

                                <div style={{backgroundColor: "#f7f9dd", marginBottom: 30}}>
                                    <label style={{textAlign: 'center', marginRight: 15, }}>Blurb:</label>
                                    <br/>
                                    <textarea
                                        style={{width: 600}}
                                        rows={3}
                                        placeholder={"Blurb"}
                                        value={this.state.blurb}
                                        onChange={(e) => this.setState({blurb: e.target.value})}
                                    />
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

const CreateTheTrainer = graphql(CREATE_TRAINER, {options: { fetchPolicy: 'network-only' }})(CreateTrainer);


/*******Component Trainer**********/

class TrainerList extends React.Component{
    render(){
        return(
            <Query query={TRAINER_LIST}>
                {({loading, error, data}) => {
                    if(loading) return "Loading...";
                    if(error) return `Error! ${error.message}`;
                    return(
                        <div style={{alignItems:"center", justifyContent:"center"}}>
                            <NavigationBar/>
                            <div style={{display:'flex', flexDirection:'row'}}>
                                <h2 style={{marginLeft: 20}}>Trainer:</h2>
                                <CreateTheTrainer />
                            </div>
                            <div >
                                <table style={{margin: 10, padding: 20, border:'1px solid black', alignContent:"center", textAlign: "center"}}>
                                    <tbody>
                                    <tr >
                                        <th className={'th'}>Image:</th>
                                        <th className={"th"}>Name:</th>
                                        <th className={'th'}>Email:</th>
                                        <th className={'th'}>Certifications:</th>
                                        <th className={'th'}>Blurb:</th>
                                        <th className={'th'}>Description:</th>
                                        <th className={"th"}>Created/Updated:</th>
                                        <th className={'th'}>ClassList:</th>
                                        <th className={'th'}>TrainerWorkouts:</th>

                                    </tr>
                                    {data.allTrainers.map(({id, firstName, lastName, email, description, createdAt, certification, blurb,
                                                                 workouts, alsoInstructor, imageUrl, updatedAt}) => (
                                            <tr key={id}>
                                                <td style={{ border:'2px solid black',  width: 150, }}><img style={{height: undefined, width: 'auto'}} src={imageUrl} alt={firstName} /></td>
                                                <td style={{ border:'2px solid black', minWidth: 50, }}>{firstName} {lastName}</td>
                                                <td style={{ border:'1px solid black', width: 100, padding:2, fontSize: 10}}>{email}</td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:2, fontSize: 10}}>{certification}</td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:2, fontSize: 10}}>{blurb}</td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:1, fontSize: 10}}>{description}</td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:1, fontSize: 10}}>c: {moment(createdAt).format("M/D/Y")}<br/>u: {moment(updatedAt).format("M/D/Y")}</td>

                                                <td style={{ border:'1px solid black',  width: 200, padding:1, fontSize: 10, fontStyle:"italic" }}>
                                                    {alsoInstructor.map(({classes}, index) => (
                                                        <p key={index}>{classes.map(({title}) => title).join("; ")}</p>
                                                    ))}
                                                </td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:1, fontSize: 10, fontStyle:"italic" }}>
                                                    <p style={{width: 200, }}>{workouts.map(({title}) => title).join("; ") + "\n"} </p>
                                                </td>
                                                <td style={{ border:'1px solid black',  width: 70, padding:1 }}>
                                                    <RemoveTrainer id={id} firstName={firstName}/>
                                                </td>
                                                <td style={{ border:'1px solid black',  width: 70, padding:1 }}>
                                                    <UpdateTheTrainer id={id}/>
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

