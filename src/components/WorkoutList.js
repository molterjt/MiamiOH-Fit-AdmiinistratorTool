import React from 'react';
import {graphql, Query, Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import NavigationBar from './NavigationBar';
import moment from 'moment';
import Ionicon from 'react-ionicons'
import axios from "axios/index";
import Modal from "react-modal";

const album_id = '2Kk4EVi';
const Imgur_Client_Id = '06e18547aec23a5';

const DELETE_WORKOUT = gql`
    mutation deleteWorkout($id: ID!){
        deleteWorkout(id:$id){
            id
        }
    }
`

const ALL_WORKOUTS_Q = gql`
    query allWorkouts{
        allWorkouts{
            id
            title
            isPublished
            description
            exercises{id, name, sets, reps, intensity}
            imageUrl
            date
            createdAt
            updatedAt
            author{firstName}
        }
        allTrainers{id, firstName, email}
        allExercises {
            name
            sets
            reps
            intensity
            restIntervals
            imageUrl
            createdAt
            description
            id
        }
    }
`

const SINGLE_WORKOUT = gql`
    query singleWorkout($id: ID!){
        Workout(id: $id){
            id
            title
            date
            isPublished
            description
            exercises{id, name, sets, reps, intensity}
            imageUrl
            createdAt
            author{firstName}
        }
        allTrainers{id, firstName, email}
        allExercises {
            name
            sets
            reps
            intensity
            restIntervals
            imageUrl
            createdAt
            description
            id
        }
    }
`

const UPDATE_WORKOUT = gql`
    mutation ($id: ID!, $title: String, $date:String, $description: String, $imageUrl: String, $exerciseArray: [ID!], $typeArray: [ID!], $author: ID){
        updateWorkout(id: $id, title: $title, date: $date, description: $description, imageUrl: $imageUrl, exercisesIds: $exerciseArray, typeIds: $typeArray, authorId: $author){
            id
            title
            exercises{id, name, sets, reps}
            imageUrl
            createdAt
            author{firstName}
        }
    }
`

const CREATE_WORKOUT = gql`
    mutation ($title: String!, $date:String, $description: String, $imageUrl: String, $exerciseArray: [ID!], $typeArray: [ID!], $author: ID ){
        createWorkout(title: $title, date: $date, description: $description, imageUrl: $imageUrl, exercisesIds: $exerciseArray, typeIds: $typeArray, authorId: $author){
            id
            title
            exercises{id, name, sets, reps}
            imageUrl
            description
            createdAt
            author{firstName}
        }
    }
`

const WORKOUT_ISPUBLISHED = gql`
    mutation updateIsPublished($id: ID!, $show: Boolean){
        updateWorkout(id:$id, isPublished: $show){
            isPublished
        }
    }
`
/*******Delete Workout**********/
const RemoveWorkout = ({id}) => {
    return (
        <Mutation
            mutation={DELETE_WORKOUT}
        >
            {(deleteWorkout, {data}) => (
                <Ionicon icon="ios-trash" onClick={ () => {
                    if(window.confirm("Are you really, really sure you want to DELETE?  There's no take backs!")){
                        deleteWorkout({
                            variables: {
                                id
                            },
                            refetchQueries: [ { query: ALL_WORKOUTS_Q }],
                        });
                        console.log("Workout with id: " + id + " was deleted");
                    }
                }} fontSize="35px" color="black"/>
            )}
        </Mutation>
    );
}

/*******Update Workout**********/
class UpdateWorkout extends React.Component{
    constructor(props){
        super(props);

        this.state={
            title: undefined,
            date: undefined,
            description: undefined,
            imageUrl: undefined,
            author: undefined,
            checkedExercises: [],
            typeCategoryArray: [],
            gallery: [],

        };
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this._handleWorkoutUpdateSubmit=this._handleWorkoutUpdateSubmit.bind(this);
        this._handleExerciseListCheck=this._handleExerciseListCheck.bind(this);
        this._handleExerciseUpdate=this._handleExerciseUpdate.bind(this);

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
    _handleExerciseUpdate = async (id) => {
        await this.props.mutate({
            variables:{
                id:id,
                exerciseArray: this.state.checkedExercises,
            },
            refetchQueries:[
                {query: SINGLE_WORKOUT, variables:{id: id}}
            ]
        })

    };
    _handleWorkoutUpdateSubmit = async (id) => {
        try{
            await this.props.mutate({
                variables:{
                    id: id,
                    title: this.state.title,
                    date: this.state.date,
                    description: this.state.description,
                    imageUrl: this.state.imageUrl,
                    author: this.state.author,
                },
                refetchQueries:[
                    {query: ALL_WORKOUTS_Q}
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
                    <Query query={SINGLE_WORKOUT} variables={{id: this.props.id}}>
                        {({loading, error, data}) => {
                            if (loading) return "Loading...";
                            if (error) return `Errro! ${error.message}`;
                            const exerciseList = data.allExercises;
                            const authorList = data.allTrainers;
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
                                                    await this._handleWorkoutUpdateSubmit(data.Workout.id);
                                                    this.closeModal();
                                                }}
                                            >
                                                <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', border: '1px solid gray' }}>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "30%", height: 180, padding:10, border: '1px solid gray' }}>
                                                        <label>Title:</label>
                                                        <br/>
                                                        <input
                                                            style={{width: 240, paddingLeft: 10}}
                                                            name={'title'}
                                                            value={this.state.title}
                                                            placeholder={data.Workout.title}
                                                            onChange={ (e) => this.setState({title: e.target.value})}
                                                        />
                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "30%", height: 180, padding:10, border: '1px solid gray'  }}>
                                                        <label>Date:</label>
                                                        <br/>
                                                        <input
                                                            style={{width: 240, paddingLeft: 10}}
                                                            value ={this.state.date}
                                                            placeholder = {data.Workout.date}
                                                            onChange = {(e) => this.setState({date: e.target.value})}
                                                        />
                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "40%", height: 180, padding:10, border: '1px solid gray' }}>
                                                        <label>Current Image:</label>
                                                        <br/>
                                                        <img
                                                            src={data.Workout.imageUrl}
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
                                                            placeholder={data.Workout.description}
                                                            value={this.state.description}
                                                            onChange={(e) => this.setState({description: e.target.value})}
                                                        />
                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "100%", height: 180, padding:10, border: '1px solid gray' }}>
                                                        <select
                                                            name={"authorList"}
                                                            value={this.state.author}
                                                            onChange={(e) => this.setState({author: e.target.value})}
                                                            className={"form-select"}
                                                        >
                                                            <option style={{marginLeft: 10}}>Select Author</option>
                                                            {authorList.map((obj) => (
                                                                <option key={obj.id} value={obj.id}>
                                                                    {obj.firstName}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "100%", border: '1px solid gray', padding: 30}}>
                                                        <div style={{ marginTop: 30,  justifyContent:'center', textAlign:'center', alignContent:'center', alignItems:'center'}}>
                                                            <label>Current Exercises:</label>
                                                            {data.Workout.exercises.map(({name, sets, reps, intensity}, index) =>
                                                                <label key={index} style={{marginLeft: 10,  padding: 5,
                                                                    fontSize: 14, width: 'auto', color:"#2fa3fa", fontWeight:"normal"}}>{name}: ({sets} x {reps})</label>
                                                            )}
                                                        </div>
                                                        <label className='w-40 pa3 mv2' style={{marginTop: 40}}>Select New Exercises:</label>
                                                        <br />
                                                        {exerciseList.map((obj, index) =>
                                                            <div style={{display:"inline", }} key={index}>
                                                                <input
                                                                    style={{marginLeft: 10}}
                                                                    type={"checkbox"}
                                                                    value={obj.id}
                                                                    checked={this.state.checkedExercises.indexOf(obj.id) > -1}
                                                                    onChange={this._handleExerciseListCheck }
                                                                />
                                                                <label style={{marginLeft: 10, fontWeight:"normal", width: 'auto'}}>{obj.name}: ({obj.sets} x {obj.reps})</label>
                                                            </div>
                                                        )}
                                                        <div style={{marginTop: 40}}>
                                                            <button
                                                                className={"btn btn-primary"}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    this._handleExerciseUpdate(data.Workout.id);
                                                                }}>Update Exercises</button>
                                                        </div>
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
const UpdateTheWorkout = graphql(UPDATE_WORKOUT, {options: { fetchPolicy: 'network-only' }})(UpdateWorkout);

/*******Create Workout**********/
class CreateWorkout extends React.Component{
    constructor(props){
        super(props);

        this.state={
            title: undefined,
            date: undefined,
            description: undefined,
            imageUrl: undefined,
            author: undefined,
            checkedExercises: [],
            typeCategoryArray: [],
            gallery: [],

        };
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this._handleWorkoutCreateSubmit=this._handleWorkoutCreateSubmit.bind(this);
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

    _handleWorkoutCreateSubmit = async () => {
        try{
            await this.props.mutate({
                variables:{
                    title: this.state.title,
                    date: this.state.date,
                    description: this.state.description,
                    imageUrl: this.state.imageUrl,
                    exerciseArray: this.state.checkedExercises,
                    author: this.state.author
                },
                refetchQueries:[
                    {query: ALL_WORKOUTS_Q}
                ]
            })
        } catch (e) {
            console.log(e.message)
        }
    };
    render(){
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
                        <h1>Create Workout</h1>
                        <form
                            style={{textAlign: 'center', marginTop: 70}}
                            onSubmit={ async(e) => {
                                e.preventDefault();
                                await this._handleWorkoutCreateSubmit();
                                this.closeModal();
                            }}
                        >
                            <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', border: '1px solid gray' }}>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray' }}>
                                    <label>Title:</label>
                                    <br/>
                                    <input
                                        style={{width: 240, paddingLeft: 10}}
                                        name={'title'}
                                        value={this.state.title}
                                        placeholder={'Workout Title'}
                                        onChange={ (e) => this.setState({title: e.target.value})}
                                    />
                                </div>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                    <label>Date:</label>
                                    <br/>
                                    <input
                                        style={{width: 240, paddingLeft: 10}}
                                        value ={this.state.date}
                                        placeholder = {'Display Date'}
                                        onChange = {(e) => this.setState({date: e.target.value})}
                                    />
                                </div>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray', alignSelf:'center',  }}>
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
                            </div>
                            <div style={{backgroundColor: "#f7f9dd", width: "100%", height: 180, padding:10, border: '1px solid gray' }}>
                                <select
                                    name={"authorList"}
                                    value={this.state.author}
                                    onChange={(e) => this.setState({author: e.target.value})}
                                    className={"form-select"}
                                >
                                    <option style={{marginLeft: 10}}>Select Author</option>
                                    {this.props.trainerList.map((obj) => (
                                        <option key={obj.id} value={obj.id}>
                                            {obj.firstName}
                                        </option>
                                    ))}
                                </select>
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
                            <div style={{backgroundColor: "#f7f9dd", width: "100%", border: '1px solid gray', padding: 30}}>
                                <label className='w-40 pa3 mv2' style={{marginTop: 40}}>Select New Exercises:</label>
                                <br />
                                {this.props.exerciseList.map((obj, index) =>
                                    <div style={{display:"inline", }} key={index}>
                                        <input
                                            style={{marginLeft: 10}}
                                            type={"checkbox"}
                                            value={obj.id}
                                            checked={this.state.checkedExercises.indexOf(obj.id) > -1}
                                            onChange={this._handleExerciseListCheck }
                                        />
                                        <label style={{marginLeft: 10, fontWeight:"normal", width: 'auto'}}>{obj.name}: ({obj.sets} x {obj.reps})</label>
                                    </div>
                                )}
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

const CreateTheWorkout = graphql(CREATE_WORKOUT, {options: { fetchPolicy: 'network-only' }})(CreateWorkout);

/*******Publish Workout**********/
const EditIsPublished = ({id, checked}) => {
    return(
        <Mutation mutation={WORKOUT_ISPUBLISHED}>
            {(updateWorkout, {data}) => (
                <form style={{flexDirection: "row"}}>
                    <label>Yes</label>
                    <input
                        style={{marginLeft: 5}}
                        type={"radio"}
                        name={"True"}
                        value={true}
                        checked={checked === true}
                        onChange={ e => {
                            if(window.confirm("Do you want to publish to mobile App?")){
                                updateWorkout({
                                    variables: {
                                        id,
                                        show: true
                                    },
                                    refetchQueries: [ { query: SINGLE_WORKOUT, variables: {id} }],
                                });
                                console.log("GroupFitClass with id: " + id + " was updated to " + true);
                            }
                        }}
                    />
                    <label style={{marginLeft: 15}}>No</label>
                    <input
                        style={{marginLeft: 5}}
                        type={"radio"}
                        value={false}
                        checked={checked === false}
                        name={"False"}
                        onChange={ e => {
                            if(window.confirm("Do you want to remove from published?")){
                                updateWorkout({
                                    variables: {
                                        id,
                                        show: false
                                    },
                                    refetchQueries: [ { query: SINGLE_WORKOUT, variables: {id} }],
                                });
                                console.log("GroupFitClass with id: " + id + " was updated to " + false);
                            }
                        }}
                    />
                </form>
            )}
        </Mutation>
    )
}

/*******Component Workout**********/
class WorkoutList extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isPublished: null,
        };
        this.changePublishedStatus = this.changePublishedStatus.bind(this);
    }
    changePublishedStatus(){
        this.setState({isPublished: !this.state.isPublished});
    }
    render() {
        return(
            <Query query={ALL_WORKOUTS_Q}>
                {({loading, error, data}) => {
                    if(loading) return "Loading...";
                    if(error) return `Errro! ${error.message}`;
                    const exerciseList = data.allExercises;
                    const trainerList = data.allTrainers;
                    return(
                        <div>
                            <NavigationBar/>
                            <div style={{marginLeft:10, display:'flex', flexDirection:'row'}}>
                                <h2>Workout</h2>
                                <CreateTheWorkout exerciseList={exerciseList} trainerList={trainerList}/>
                            </div>
                            <div style={{justifyContent:"center", alignItems:"center", marginBottom: 40}}>
                                <table style={{margin: 10, padding: 30, border:'1px solid black', alignItems:"center" }}>
                                    <tbody>
                                    <tr style={{justifyContent:"center", textAlign: 'center'}}>
                                        <th className={"th"}>Image:</th>
                                        <th className={"th"}>Title:</th>
                                        <th style={{color: "#fff", backgroundColor: "#000"}} className={"th"}>Exercises:</th>
                                        <th className={"th"}>Author:</th>
                                        <th className={"th"}>Display Date:</th>
                                        <th className={"th"}>Description:</th>
                                        <th className={"th"}>Published:</th>
                                        <th className={"th"}>Created_At:</th>

                                    </tr>
                                    {data.allWorkouts.map(({title, isPublished, createdAt, updatedAt, imageUrl, id, exercises, date, author, description}) => (
                                            <tr key={id} style={{justifyContent:"center", textAlign: 'center'}}>
                                                <td style={{ border:'2px solid black',  width: 200, }}><img style={{height: undefined, width: 'auto'}} src={imageUrl} alt={title} /></td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:1}}>{title}</td>
                                                <td style={{ border:'2px solid black',  width: 400,padding:1 }}>
                                                    <div style={{display:'flex', flexDirection: 'row',  textAlign: 'center', color: "#fff"}}>
                                                        <div style={{ border:'2px solid white',width: "50%", backgroundColor: "#000"}}><h5>Name</h5></div>
                                                        <div style={{ border:'2px solid white', width: "25%", backgroundColor: "#000"}}><h5>Sets</h5></div>
                                                        <div style={{ border:'2px solid white', width: "25%", backgroundColor: "#000"}}><h5>Reps</h5></div>
                                                    </div>
                                                    {exercises.map(({id, name, sets, reps}) => (
                                                    <div key={id} style={{display:'flex', flexDirection: 'row',  textAlign: 'center', backgroundColor: "#fff"}}>
                                                        <p style={{ borderTop:'1px solid black', borderBottom:'1px solid black',  width: "50%", justifyContent:"center",padding:1 }}>{name}</p>
                                                        <p style={{ borderTop:'1px solid black', borderBottom:'1px solid black',  width: "25%", justifyContent:"center",padding:1 }}>{sets}</p>
                                                        <p style={{ borderTop:'1px solid black', borderBottom:'1px solid black',  width: "25%", justifyContent:"center",padding:1}}>{reps}</p>
                                                    </div>
                                                    ))}
                                                </td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:1 }}>{author.firstName}</td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:1}}>{date}</td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:1 }}>{description}</td>
                                                <td className={"td"}><EditIsPublished id={id} checked={isPublished}/></td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:1}}>c: {moment(createdAt).format("M/D/Y")}<br/>u: {moment(updatedAt).format("M/D/Y")}</td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:1}}><RemoveWorkout id={id}/></td>
                                                <td style={{ border:'1px solid black',  width: 100, padding:1}}><UpdateTheWorkout id={id}/></td>
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

export default WorkoutList