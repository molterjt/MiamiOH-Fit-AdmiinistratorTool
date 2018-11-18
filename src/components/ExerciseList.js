import React from 'react';
import {graphql, Query, Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import NavigationBar from './NavigationBar';
import moment from 'moment';
import Ionicon from 'react-ionicons'
import axios from "axios/index";
import Modal from "react-modal";
import {sortBy} from "lodash";


const album_id = '2Kk4EVi';
const Imgur_Client_Id = '06e18547aec23a5';

const DELETE_EXERCISE = gql`
    mutation deleteExercise($id: ID!){
        deleteExercise(id: $id){
            id
        }
    }
`

const EXERCISE_LIST = gql`
    query{
        allExercises{
            name
            sets
            intensity
            reps
            imageUrl
            createdAt
            updatedAt
            id
            description
        }
    }
`
const SINGLE_EXERCISE = gql`
    query($id: ID!){
        Exercise(id:$id){
            name
            sets
            intensity
            reps
            tempo
            imageUrl
            createdAt
            updatedAt
            id
            description
        }
    }
`

const UPDATE_EXERCISE = gql`
    mutation ($id: ID!, $name: String, $sets: String, $reps: String, $intensity: String, $tempo: String, $imageUrl: String, $description: String) {
        updateExercise(id: $id, name: $name, sets: $sets, reps: $reps, intensity: $intensity, tempo: $tempo, imageUrl: $imageUrl, description: $description) {
            id
            name
            sets
            reps
            intensity
            tempo
            description
            imageUrl
        }
    }
`
const CREATE_EXERCISE = gql`
    mutation ($name: String!, $sets: String, $reps: String, $intensity: String, $tempo: String, $imageUrl: String, $description: String) {
        createExercise(name: $name, sets: $sets, reps: $reps, intensity: $intensity, tempo: $tempo, imageUrl: $imageUrl, description: $description) {
            id
            name
            sets
            reps
            intensity
            tempo
            description
            imageUrl
        }
    }
`

/*******Deletes Exercise**********/
const RemoveExercise = ({id}) => {
    return (
        <Mutation
            mutation={DELETE_EXERCISE}
        >
            {(deleteExercise, {data}) => (
                <Ionicon icon="ios-trash" onClick={ () => {
                    if(window.confirm("Are you really, really sure you want to DELETE?  There's no take backs!")){
                        deleteExercise({
                            variables: {
                                id
                            },
                            refetchQueries: [ { query: EXERCISE_LIST }],
                        });
                        console.log("Exercise with id: " + id + " was deleted");
                    }
                }} fontSize="35px" color="black"/>
            )}
        </Mutation>
    );
};

/*******Updates Exercise**********/

class UpdateExercise extends React.Component{
    constructor(props){
        super(props);

        this.state={
            name: undefined,
            sets: undefined,
            reps: undefined,
            intensity: undefined,
            tempo: undefined,
            description: undefined,
            imageUrl: undefined,
            gallery: [],

        };
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this._handleExerciseUpdateSubmit=this._handleExerciseUpdateSubmit.bind(this);
        this._handleExerciseListCheck=this._handleExerciseListCheck.bind(this);

    }
    _handleExerciseListCheck(e){
        let newSelection = e.target.value;
        let newCheckedExerciseList;

        if(this.state.checkedExercises.indexOf(newSelection) > -1){
            newCheckedExerciseList = this.state.checkedExercises.filter(s => s !== newSelection)
        } else {
            newCheckedExerciseList = [...this.state.checkedExercises, newSelection];
        }
        this.setState({checkedExercises: newCheckedExerciseList}, () => console.log('day selection', this.state.checkedExercises));
        console.log(this.state.checkedExercises)
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
    _handleExerciseUpdateSubmit = async (id) => {
        try{
            await this.props.mutate({
                variables:{
                    id: id,
                    name: this.state.name,
                    sets: this.state.sets,
                    reps: this.state.reps,
                    intensity: this.state.intensity,
                    tempo: this.state.tempo,
                    description: this.state.description,
                    imageUrl: this.state.imageUrl,
                },
                refetchQueries:[
                    {query: EXERCISE_LIST}
                ]
            })
        } catch (e) {
            console.log(e.message)
        }
    };

    render(){
        const imageList = sortBy(this.state.gallery, "title");
        return(
            <div>
                <div className={"justify-center alignItems-center"}>
                    <Ionicon icon="md-build" onClick={() => this.openModal()} fontSize="35px" color="gray"/>
                </div>
                <div>
                    <Query query={SINGLE_EXERCISE} variables={{id: this.props.id}}>
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
                                                    await this._handleExerciseUpdateSubmit(data.Exercise.id);
                                                    this.closeModal();
                                                }}
                                            >
                                                <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', border: '1px solid gray' }}>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "33.333%", height: 180, padding:10, border: '1px solid gray' }}>
                                                        <label>Name:</label>
                                                        <br/>
                                                        <input
                                                            style={{width: 240, paddingLeft: 10}}
                                                            name={'title'}
                                                            value={this.state.name}
                                                            placeholder={data.Exercise.name}
                                                            onChange={ (e) => this.setState({name: e.target.value})}
                                                        />
                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                                        <label>Sets:</label>
                                                        <br/>
                                                        <input
                                                            style={{width: 240, paddingLeft: 10}}
                                                            value ={this.state.sets}
                                                            placeholder = {data.Exercise.sets}
                                                            onChange = {(e) => this.setState({sets: e.target.value})}
                                                        />
                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                                        <label>Reps:</label>
                                                        <br/>
                                                        <input
                                                            style={{width: 240, paddingLeft: 10}}
                                                            value ={this.state.reps}
                                                            placeholder = {data.Exercise.reps}
                                                            onChange = {(e) => this.setState({reps: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', border: '1px solid gray' }}>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "40%", height: 180, padding:10, border: '1px solid gray' }}>
                                                        <label>Current Image:</label>
                                                        <br/>
                                                        <img
                                                            src={data.Exercise.imageUrl}
                                                            width={160}
                                                            height={100}
                                                            alt={"GroupFitClass"}
                                                            style={{marginRight: 10, marginBottom: 10}}
                                                        />
                                                        <br/>
                                                        <select
                                                            name={"imageList"}
                                                            value={this.state.imageUrl}
                                                            onChange={(e) => this.setState({imageUrl: e.target.value})}
                                                            className={"form-select"}
                                                        >
                                                            <option style={{marginLeft: 10}}>Select New Image</option>
                                                            {imageList.map((obj) => (
                                                                <option key={obj.id} value={obj.link}>
                                                                    {obj.title}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "30%", height: 180, padding:10, border: '1px solid gray'  }}>
                                                        <label>Intensity:</label>
                                                        <br/>
                                                        <input
                                                            style={{width: 240, paddingLeft: 10}}
                                                            value ={this.state.intensity}
                                                            placeholder = {data.Exercise.intensity}
                                                            onChange = {(e) => this.setState({intensity: e.target.value})}
                                                        />
                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "30%", height: 180, padding:10, border: '1px solid gray'  }}>
                                                        <label>Tempo:</label>
                                                        <br/>
                                                        <textarea
                                                            style={{width: 240, paddingLeft: 10}}
                                                            rows={4}
                                                            value ={this.state.tempo}
                                                            placeholder = {data.Exercise.tempo}
                                                            onChange = {(e) => this.setState({tempo: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{backgroundColor: "#c2d9c3", width: "100%", height: 180, padding:10, border: '1px solid gray' }}>
                                                    <label style={{textAlign: 'center', marginRight: 20}}>Description:</label>
                                                    <br/>
                                                    <textarea
                                                        style={{width: 600, padding:10}}
                                                        rows={5}
                                                        placeholder={data.Exercise.description}
                                                        value={this.state.description}
                                                        onChange={(e) => this.setState({description: e.target.value})}
                                                    />
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
const UpdateTheExercise = graphql(UPDATE_EXERCISE, {options: { fetchPolicy: 'network-only' }})(UpdateExercise);

/*******Creates Exercise**********/

class CreateExercise extends React.Component{
    constructor(props){
        super(props);
        this.state={
            name: undefined,
            sets: undefined,
            reps: undefined,
            intensity: undefined,
            tempo: undefined,
            description: undefined,
            imageUrl: undefined,
            gallery: [],
        };
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this._handleCreateExerciseSubmit=this._handleCreateExerciseSubmit.bind(this);
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


    _handleCreateExerciseSubmit = async () => {
        await this.props.mutate({
            variables:{
                name: this.state.name,
                sets: this.state.sets,
                reps: this.state.reps,
                intensity: this.state.intensity,
                tempo: this.state.tempo,
                description: this.state.description,
                imageUrl: this.state.imageUrl,
            },
            refetchQueries:[
                {query: EXERCISE_LIST}
            ]
        })
    };

    render(){
        const imageList = sortBy(this.state.gallery, "title");
        return(
            <div>
                <button
                    onClick={() => this.openModal()}
                    className={"btn btn-success "}
                    style={{fontWeight: 700, padding: 5, border: "2px solid #000000", textAlign: "center", marginLeft:15, marginTop:20}}
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
                        <h1>Create Exercise</h1>
                        <form
                            style={{textAlign: 'center', marginTop: 70}}
                            onSubmit={ async(e) => {
                                e.preventDefault();
                                await this._handleCreateExerciseSubmit();
                                this.closeModal();
                            }}
                        >
                            <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', border: '1px solid gray' }}>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray' }}>
                                    <label>Name:</label>
                                    <br/>
                                    <input
                                        style={{width: 240, paddingLeft: 10}}
                                        name={'title'}
                                        value={this.state.name}
                                        placeholder={'Exercise Name'}
                                        onChange={ (e) => this.setState({name: e.target.value})}
                                    />
                                </div>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                    <label>Sets:</label>
                                    <br/>
                                    <input
                                        style={{width: 240, paddingLeft: 10}}
                                        value ={this.state.sets}
                                        placeholder = {'Sets'}
                                        onChange = {(e) => this.setState({sets: e.target.value})}
                                    />
                                </div>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                    <label>Reps:</label>
                                    <br/>
                                    <input
                                        style={{width: 240, paddingLeft: 10}}
                                        value ={this.state.reps}
                                        placeholder = {'Reps'}
                                        onChange = {(e) => this.setState({reps: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', border: '1px solid gray', justifyContent:'center',}}>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray', alignSelf:'center',  }}>
                                    <select
                                        name={"imageList"}
                                        value={this.state.imageUrl}
                                        onChange={(e) => this.setState({imageUrl: e.target.value})}
                                        className={"form-select"}
                                    >
                                        <option style={{marginLeft: 10}}>Select New Image</option>
                                        {imageList.map((obj) => (
                                            <option key={obj.id} value={obj.link}>
                                                {obj.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                    <label>Intensity:</label>
                                    <br/>
                                    <input
                                        style={{width: 240, paddingLeft: 10}}
                                        value ={this.state.intensity}
                                        placeholder = {'Intensity'}
                                        onChange = {(e) => this.setState({intensity: e.target.value})}
                                    />
                                </div>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                    <label>Tempo:</label>
                                    <br/>
                                    <textarea
                                        style={{width: 240, paddingLeft: 10}}
                                        rows={4}
                                        value ={this.state.tempo}
                                        placeholder = {'Tempo'}
                                        onChange = {(e) => this.setState({tempo: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div style={{backgroundColor: "#f7f9dd", width: "100%", height: 180, padding:10, border: '1px solid gray' }}>
                                <label style={{textAlign: 'center', marginRight: 20}}>Description:</label>
                                <br/>
                                <textarea
                                    style={{width: 600, padding:10}}
                                    rows={5}
                                    placeholder={'Description'}
                                    value={this.state.description}
                                    onChange={(e) => this.setState({description: e.target.value})}
                                />
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
    }
}

const CreateTheExercise = graphql(CREATE_EXERCISE, {options: { fetchPolicy: 'network-only' }})(CreateExercise);


class ExerciseList extends React.Component{
    render(){
        return(
            <Query query={EXERCISE_LIST}>
                {({loading, error, data}) => {
                    if(loading) return "Loading...";
                    if(error) return `Errro! ${error.message}`;
                    return(
                        <div style={{alignItems:"center", justifyContent:"center"}}>
                            <NavigationBar/>
                            <div style={{marginLeft:10, display:'flex', flexDirection:'row'}}>
                                <h2>Exercise</h2>
                                <CreateTheExercise/>                            </div>
                            <div >
                                <table style={{margin: 10, padding: 20,alignContent:"center", justifyContent: "center", textAlign:'center'}}>
                                    <tbody>
                                    <tr >
                                        <th className={'th'}>Image:</th>
                                        <th className={'th'}>Exercise:</th>
                                        <th className={'th'}>sets:</th>
                                        <th className={'th'}>reps:</th>
                                        <th className={'th'}>description:</th>
                                        <th className={'th'}>intensity:</th>
                                        <th className={'th'}>created/updated:</th>
                                    </tr>
                                    {data.allExercises.map(({name, sets, id, reps, imageUrl, description, intensity, createdAt, updatedAt}) => (
                                            <tr key={id}>
                                                <td style={{ border:'2px solid black',  width: 150, padding:0 }}><img style={{height: undefined, width: 'auto'}} src={imageUrl} alt={name} /></td>
                                                <td style={{ border:'2px solid black',  width: 150, padding:2}}>{name}</td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:2}}>{sets}</td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:2}}>{reps}</td>
                                                <td style={{ border:'1px solid black',  width: 400, padding:2}}>{description}</td>
                                                <td style={{ border:'1px solid black',  width: 150, padding:2}}>{intensity}</td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:2}}>c: {moment(createdAt).format("M/D/Y")}<br/>u: {moment(updatedAt).format("M/D/Y")}</td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:1}}><RemoveExercise id={id}/></td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:1}}><UpdateTheExercise id={id}/></td>
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

export default ExerciseList;

