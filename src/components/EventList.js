import React from 'react';
import {graphql, Query, Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import NavigationBar from './NavigationBar';
import moment from 'moment';
import Ionicon from 'react-ionicons'
import axios from "axios/index";
import Modal from "react-modal";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TimePicker from 'material-ui/TimePicker';
import DatePicker from 'material-ui/DatePicker';

const album_id = '2Kk4EVi';
const Imgur_Client_Id = '06e18547aec23a5';

const DELETE_EVENT = gql`
    mutation deleteEvent($id: ID!){
        deleteEvent(id:$id){
            id
        }
    }
`

const ALL_EVENTS = gql`
    query{
        allEvents{
            id
            name
            isPublished
            imageUrl
            date
            fees
            time
            description
            publishDate
            createdAt
            updatedAt
            location{facilityName}
        }
        allFacilities{facilityName, id}
    }
`

const SINGLE_EVENT = gql`
    query($id: ID!){
        Event(id: $id){
            id
            name
            isPublished
            imageUrl
            fees
            time
            registerUrl
            date
            description
            publishDate
            createdAt
            updatedAt
            location{facilityName}
        }
        allFacilities{facilityName, id}
    }
`


/*******Event Publishing**********/

const EVENT_ISPUBLISHED = gql`
    mutation updateIsPublished($id: ID!, $show: Boolean){
        updateEvent(id:$id, isPublished: $show){
            isPublished
        }
    }
`

/*******Delete Event**********/
const RemoveEvent = ({id}) => {
    return (
        <Mutation
            mutation={DELETE_EVENT}
        >
            {(deleteEvent, {data}) => (
                <Ionicon icon="ios-trash" onClick={ () => {
                    if(window.confirm("Are you really, really sure you want to DELETE?  There's no take backs!")){
                        deleteEvent({
                            variables: {
                                id
                            },
                            refetchQueries: [ { query: ALL_EVENTS }],
                        });
                        console.log("Workout with id: " + id + " was deleted");
                    }
                }} fontSize="35px" color="black"/>
            )}
        </Mutation>
    );
};

const UPDATE_EVENT = gql`
    mutation($id:ID!, $name:String, $imageUrl:String, $registerUrl:String, $date:String, $publishDate:DateTime, $time:String, $fees:String, $description:String,
    $location: ID){
        updateEvent(id:$id, name:$name, imageUrl:$imageUrl, registerUrl:$registerUrl, date:$date, publishDate:$publishDate, time:$time, fees:$fees, 
        description:$description, locationId:$location){
            id
            name
            imageUrl
            registerUrl
            publishDate
            date
            time
            fees
            description
            location{facilityName}
        }
    }
`

const CREATE_EVENT = gql`
    mutation($name:String!, $imageUrl:String, $registerUrl:String, $date:String, $publishDate:DateTime, $time:String, $fees:String, $description:String,
    $location:ID){
        createEvent(name:$name, imageUrl:$imageUrl, registerUrl:$registerUrl, date:$date, publishDate:$publishDate, time:$time, fees:$fees,
            description:$description, locationId:$location){
            id
            name
            imageUrl
            registerUrl
            publishDate
            date
            time
            fees
            description
            location{facilityName}
        }
    }
`
/*******Publish Event**********/
const EditIsPublished = ({id, checked}) => {
    return(
        <Mutation mutation={EVENT_ISPUBLISHED}>
            {(updateEvent, {data}) => (
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
                                updateEvent({
                                    variables: {
                                        id,
                                        show: true
                                    },
                                    refetchQueries: [ { query: SINGLE_EVENT, variables: {id} }],
                                });
                                console.log("Event with id: " + id + " was updated to " + true);
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
                                updateEvent({
                                    variables: {
                                        id,
                                        show: false
                                    },
                                    refetchQueries: [ { query: SINGLE_EVENT, variables: {id} }],
                                });
                                console.log("Event with id: " + id + " was updated to " + false);
                            }
                        }}
                    />
                </form>
            )}
        </Mutation>
    )
};


/*type Event @model{
  id: ID! @isUnique
  name: String!
  isPublished: Boolean @defaultValue(value: "false")
  imageUrl: String
  videoUrl: String
  registerUrl: String
  date: String
  publishDate: DateTime
  time: String
  fees: String
  description: String
  discount: String
  location: Facility @relation(name: "EventLocations")
  days: [Day!]! @relation(name: "EventDays")
  users: [User!]! @relation(name: "UsersEvents")
  pictures: [Picture!]! @relation(name: "EventPictures")
  checkins: [Checkin!]! @relation(name: "EventCheckins")
  comments: [Comment!]! @relation(name: "EventComment")
  createdAt: DateTime!
  updatedAt: DateTime!
}*/
/*******Create Event**********/
class CreateEvent extends React.Component{
    constructor(props){
        super(props);

        this.state={
            name: undefined,
            imageUrl: undefined,
            registerUrl: undefined,
            date: undefined,
            time: undefined,
            fees: undefined,
            location: undefined,
            description: undefined,
            publishDate: null,
            publishTime: null,
            gallery: [],

        };
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this._handleEventCreateSubmit=this._handleEventCreateSubmit.bind(this);
        this._handleChangeStartDate = this._handleChangeStartDate.bind(this);
        this._handleStartTime = this._handleStartTime.bind(this);
        this._handlePublishDateTimeUpdate=this._handlePublishDateTimeUpdate.bind(this);

    }
    _handleChangeStartDate = (event, date) =>{
        let newDate = date;
        console.log("start newDate: " + newDate);
        this.setState({
            publishDate: newDate
        });
    };
    _handleStartTime = (event, time) => {
        this.setState({publishTime: time});
    };
    _handlePublishDateTimeUpdate = async (id) => {
        let eventStartTime = moment(this.state.publishTime);
        let eventStartDate = moment(this.state.publishDate);
        let renderStartDateTime = moment({
            year: eventStartDate.year(),
            month: eventStartDate.month(),
            day: eventStartDate.date(),
            hour: eventStartTime.hours(),
            minute: eventStartTime.minutes(),
            second: 0,
        });
        if(renderStartDateTime !== null){
            let start = moment(renderStartDateTime).toISOString();

            await this.props.mutate({
                variables:{
                    id:id,
                    publishDate: start,
                },
                refetchQueries:[
                    {query: SINGLE_EVENT}
                ]
            })
        }
    };
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
    _handleEventCreateSubmit = async () => {
        let eventStartTime = moment(this.state.publishTime);
        let eventStartDate = moment(this.state.publishDate);
        let renderStartDateTime = moment({
            year: eventStartDate.year(),
            month: eventStartDate.month(),
            day: eventStartDate.date(),
            hour: eventStartTime.hours(),
            minute: eventStartTime.minutes(),
            second: 0,
        });
        let start = moment(renderStartDateTime).toISOString();
        try{
            await this.props.mutate({
                variables:{
                    name: this.state.name,
                    imageUrl: this.state.imageUrl,
                    registerUrl: this.state.registerUrl,
                    date: this.state.date,
                    time: this.state.time,
                    fees: this.state.fees,
                    location: this.state.location,
                    publishDate: start,
                    description: this.state.description,

                },
                refetchQueries:[
                    {query: ALL_EVENTS}
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
                    style={{fontWeight: 700, padding: 5, border: "2px solid #000000", textAlign: "center", marginTop: 20, marginLeft: 15}}
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
                        <h2>Create Event</h2>
                        <form
                            style={{textAlign: 'center', marginTop: 30}}
                            onSubmit={ async(e) => {
                                e.preventDefault();
                                await this._handleEventCreateSubmit();
                                this.closeModal();

                            }}
                        >
                            <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', border: '1px solid gray' }}>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray' }}>
                                    <label>Name:</label>
                                    <br/>
                                    <input
                                        style={{width: 260, paddingLeft: 10}}
                                        name={'title'}
                                        value={this.state.name}
                                        placeholder={'Event Name'}
                                        onChange={ (e) => this.setState({name: e.target.value})}
                                    />
                                </div>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                    <label>Display Date:</label>
                                    <br/>
                                    <input
                                        style={{width: 240, paddingLeft: 10}}
                                        value={this.state.date}
                                        placeholder = {'Event Display Date'}
                                        onChange = {(e) => this.setState({date: e.target.value})}
                                    />
                                </div>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                    <label>Display Time:</label>
                                    <br/>
                                    <input
                                        style={{width: 240, paddingLeft: 10}}
                                        value ={this.state.time}
                                        placeholder = {'Event Display Time'}
                                        onChange = {(e) => this.setState({time: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', border: '1px solid gray' }}>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray' }}>
                                    <label> Image:</label>
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
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                    <label>Fees:</label>
                                    <br/>
                                    <input
                                        style={{width: 240, paddingLeft: 10}}
                                        value ={this.state.fees}
                                        placeholder = {'Event Fees'}
                                        onChange = {(e) => this.setState({fees: e.target.value})}
                                    />
                                </div>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                    <label>Registration Id:</label>
                                    <br/>
                                    <input
                                        style={{width: 240, paddingLeft: 10}}
                                        value ={this.state.registerUrl}
                                        placeholder = {'Registration Id'}
                                        onChange = {(e) => this.setState({registerUrl: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', border: '1px solid gray' }}>
                                <div style={{backgroundColor: "#f7f9dd", width: "66.666%", height: 180, padding:10, border: '1px solid gray' }}>
                                    <label style={{textAlign: 'center', marginRight: 20}}>Description:</label>
                                    <br/>
                                    <textarea
                                        style={{width: 600, padding:10}}
                                        rows={5}
                                        placeholder={'Event Description'}
                                        value={this.state.description}
                                        onChange={(e) => this.setState({description: e.target.value})}
                                    />
                                </div>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray' }}>
                                    <label>Location: </label>
                                    <br/>
                                    <select
                                        name={"location"}
                                        value={this.state.location}
                                        onChange={(e) => {
                                            this.setState({location: e.target.value});
                                        }}
                                        className={"form-select"}
                                    >
                                        <option>Select Location</option>
                                        {this.props.facilityList.map((obj) =>
                                            <option
                                                key={obj.id}
                                                value={obj.id}
                                            >
                                                {obj.facilityName}
                                            </option>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div style={{backgroundColor: "#f7f9dd", display: 'center', border: "1px gray black",  alignContent:'center', alignItems:'center', textAlign:'center', justifyContent:'center', padding: 30}}>
                                <label className='w-40 pa3 mv2'>Publish Date & Time:</label>
                                <MuiThemeProvider>
                                    <div style={{border: '1px solid gray' }}>
                                        <div style={{display: 'flex' ,flex: 1, textAlign:'center', justifyContent:'center', flexAlign: 'center', alignItems: 'center', border: '1px solid gray' }}>

                                            <div style={{display: 'flex', flexDirection: "column"}}>
                                                <DatePicker
                                                    onChange={this._handleChangeStartDate}
                                                    floatingLabelText={"Publish Date"}
                                                    value={this.state.publishDate}
                                                    firstDayOfWeek={0}

                                                />
                                            </div>
                                            <div style={{display: 'flex',  flexDirection: "column", alignItems: 'center', marginLeft: 70}}>
                                                <TimePicker
                                                    style={{fontWeight:"bold", marginTop: 25, fontSize:12, display:'inline'}}
                                                    hintText={'Publish Time'}
                                                    minutesStep={5}
                                                    floatingLabelText={"Publish Time"}
                                                    value={this.state.publishTime}
                                                    onChange={this._handleStartTime}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </MuiThemeProvider>
                                <br />
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

const CreateTheEvent = graphql(CREATE_EVENT, {options: { fetchPolicy: 'network-only' }})(CreateEvent);

/*******Update Event**********/
class UpdateEvent extends React.Component{
    constructor(props){
        super(props);

        this.state={
            name: undefined,
            imageUrl: undefined,
            registerUrl: undefined,
            date: undefined,
            time: undefined,
            fees: undefined,
            location: undefined,
            description: undefined,
            publishDate: null,
            publishTime: null,
            gallery: [],

        };
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this._handleEventUpdateSubmit=this._handleEventUpdateSubmit.bind(this);
        this._handleExerciseListCheck=this._handleExerciseListCheck.bind(this);
        this._handleChangeStartDate = this._handleChangeStartDate.bind(this);
        this._handleStartTime = this._handleStartTime.bind(this);
        this._handlePublishDateTimeUpdate=this._handlePublishDateTimeUpdate.bind(this);

    }
    _handleChangeStartDate = (event, date) =>{
        let newDate = date;
        console.log("start newDate: " + newDate);
        this.setState({
            publishDate: newDate
        });

    };
    _handleStartTime = (event, time) => {
        this.setState({publishTime: time});
    };
    _handlePublishDateTimeUpdate = async (id) => {
        let eventStartTime = moment(this.state.publishTime);
        let eventStartDate = moment(this.state.publishDate);
        let renderStartDateTime = moment({
            year: eventStartDate.year(),
            month: eventStartDate.month(),
            day: eventStartDate.date(),
            hour: eventStartTime.hours(),
            minute: eventStartTime.minutes(),
            second: 0,
        });

        let start = moment(renderStartDateTime).toISOString();

        await this.props.mutate({
            variables:{
                id:id,
                publishDate: start,
            },
            refetchQueries:[
                {query: SINGLE_EVENT, variables:{id:id}}
            ]
        })

    };
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
    _handleEventUpdateSubmit = async (id) => {
        try{
            await this.props.mutate({
                variables:{
                    id: id,
                    name: this.state.name,
                    imageUrl: this.state.imageUrl,
                    registerUrl: this.state.registerUrl,
                    date: this.state.date,
                    time: this.state.time,
                    fees: this.state.fees,
                    location: this.state.location,
                    description: this.state.description,

                },
                refetchQueries:[
                    {query: ALL_EVENTS}
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
                    <Query query={SINGLE_EVENT} variables={{id: this.props.id}}>
                        {({loading, error, data}) => {
                            if (loading) return "Loading...";
                            if (error) return `Errro! ${error.message}`;
                            const facilityList=data.allFacilities;
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
                                                    await this._handleEventUpdateSubmit(data.Event.id);
                                                    this.closeModal();
                                                }}
                                            >
                                                <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', border: '1px solid gray' }}>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "33.333%", height: 180, padding:10, border: '1px solid gray' }}>
                                                        <label>Name:</label>
                                                        <br/>
                                                        <input
                                                            style={{width: 260, paddingLeft: 10}}
                                                            name={'title'}
                                                            value={this.state.name}
                                                            placeholder={data.Event.name}
                                                            onChange={ (e) => this.setState({name: e.target.value})}
                                                        />
                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                                        <label>Display Date:</label>
                                                        <br/>
                                                        <input
                                                            style={{width: 240, paddingLeft: 10}}
                                                            value={this.state.date}
                                                            placeholder = {data.Event.date}
                                                            onChange = {(e) => this.setState({date: e.target.value})}
                                                        />
                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                                        <label>Display Time:</label>
                                                        <br/>
                                                        <input
                                                            style={{width: 240, paddingLeft: 10}}
                                                            value ={this.state.time}
                                                            placeholder = {data.Event.time}
                                                            onChange = {(e) => this.setState({time: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', border: '1px solid gray' }}>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "33.333%", height: 180, padding:10, border: '1px solid gray' }}>
                                                        <label>Current Image:</label>
                                                        <br/>
                                                        <img
                                                            src={data.Event.imageUrl}
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
                                                    <div style={{backgroundColor: "#c2d9c3", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                                        <label>Fees:</label>
                                                        <br/>
                                                        <input
                                                            style={{width: 240, paddingLeft: 10}}
                                                            value ={this.state.fees}
                                                            placeholder = {data.Event.fees}
                                                            onChange = {(e) => this.setState({fees: e.target.value})}
                                                        />
                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                                        <label>Registration Id:</label>
                                                        <br/>
                                                        <input
                                                            style={{width: 240, paddingLeft: 10}}
                                                            value ={this.state.registerUrl}
                                                            placeholder = {data.Event.registerUrl}
                                                            onChange = {(e) => this.setState({registerUrl: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', border: '1px solid gray' }}>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "66.666%", height: 180, padding:10, border: '1px solid gray' }}>
                                                        <label style={{textAlign: 'center', marginRight: 20}}>Description:</label>
                                                        <br/>
                                                        <textarea
                                                            style={{width: 600, padding:10}}
                                                            rows={5}
                                                            placeholder={data.Event.description}
                                                            value={this.state.description}
                                                            onChange={(e) => this.setState({description: e.target.value})}
                                                        />
                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "33.333%", height: 180, padding:10, border: '1px solid gray' }}>
                                                        <label>Location: </label>
                                                        <br/>
                                                        <select
                                                            name={"location"}
                                                            value={this.state.location}
                                                            onChange={(e) => {
                                                                this.setState({location: e.target.value});
                                                            }}
                                                            className={"form-select"}
                                                        >
                                                            <option>{data.Event.location.facilityName}</option>
                                                            {facilityList.map((obj) =>
                                                                <option
                                                                    key={obj.id}
                                                                    value={obj.id}
                                                                >
                                                                    {obj.facilityName}
                                                                </option>
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div style={{backgroundColor: "#c2d9c3", display: 'center', border: "1px gray black",  alignContent:'center', alignItems:'center', textAlign:'center', justifyContent:'center', padding: 30}}>
                                                    <label className='w-40 pa3 mv2'>Publish Date & Time:</label>
                                                    <MuiThemeProvider>
                                                        <div>
                                                            <p>Current: {moment(data.Event.publishDate).format("M/D/Y h:mm a")}</p>
                                                            <div style={{display: 'flex' ,flex: 1, textAlign:'center', justifyContent:'center', flexAlign: 'center', alignItems: 'center'}}>

                                                                <div style={{display: 'flex', flexDirection: "column"}}>
                                                                    <DatePicker
                                                                        onChange={this._handleChangeStartDate}
                                                                        floatingLabelText={"Publish Date"}
                                                                        value={this.state.publishDate}
                                                                        firstDayOfWeek={0}
                                                                        className={"col s4 indigo lighten-1 grey-text text-lighten-5"}
                                                                    />
                                                                </div>
                                                                <div style={{display: 'flex',  flexDirection: "column", alignItems: 'center', marginLeft: 70}}>
                                                                    <TimePicker
                                                                        style={{fontWeight:"bold", marginTop: 25, fontSize:12, display:'inline'}}
                                                                        hintText={'Publish Time'}
                                                                        minutesStep={5}
                                                                        value={this.state.publishTime}
                                                                        onChange={this._handleStartTime}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div style={{marginTop: 40}}>
                                                                <button
                                                                    className={"btn btn-primary"}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        this._handlePublishDateTimeUpdate(data.Event.id);
                                                                    }}>Update DateTimes</button>
                                                            </div>
                                                        </div>
                                                    </MuiThemeProvider>
                                                    <br />
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
const UpdateTheEvent = graphql(UPDATE_EVENT, {options: { fetchPolicy: 'network-only' }})(UpdateEvent);

/*******Component Event**********/

class EventList extends React.Component{
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
    render(){
        return(
        <Query query={ALL_EVENTS}>
            {({loading, error, data}) => {
                if(loading) return "Loading...";
                if(error) return `Errro! ${error.message}`;
                const facilityList = data.allFacilities;
                return(
                    <div>

                        <NavigationBar/>
                        <div style={{display:'flex', flexDirection:'row'}}>
                            <h2 style={{marginLeft:10}}>Event</h2>
                            <CreateTheEvent facilityList={facilityList}/>
                        </div>

                        <div style={{justifyContent:"center", alignItems:"center", marginBottom: 40}}>
                            <table style={{margin: 10, padding: 30, border:'1px solid black', alignItems:"center" }}>
                                <tbody>
                                <tr style={{justifyContent:"center", textAlign: 'center'}}>
                                    <th className={"th"}>Image:</th>
                                    <th className={"th"}>Title:</th>
                                    <th className={"th"}>Display Date/Time:</th>
                                    <th className={"th"}>Publish Date/Time:</th>
                                    <th className={"th"}>Fees:</th>
                                    <th className={"th"}>Description:</th>
                                    <th className={"th"}>Location:</th>
                                    <th className={"th"}>Published:</th>
                                    <th className={"th"}>Created/Updated:</th>
                                </tr>
                                {data.allEvents.map(({name, createdAt, updatedAt, fees, publishDate, time, imageUrl, id, date, isPublished, description, location}) => (
                                        <tr key={id} style={{justifyContent:"center", textAlign: 'center'}}>
                                            <td style={{ border:'2px solid black',  width: 200, }}><img style={{height: undefined, width: 'auto'}} src={imageUrl} alt={name} /></td>
                                            <td style={{ border:'1px solid black',  width: 100, }}>{name}</td>
                                            <td style={{ border:'1px solid black',  width: 100, }}>{date}<br/>{time}</td>
                                            <td style={{ border:'1px solid black',  width: 100, }}>{moment(publishDate).format("M/D/Y h:mm a")}</td>
                                            <td style={{ border:'1px solid black',  width: 70, }}>{fees}</td>
                                            <td style={{ border:'1px solid black',  width: 300, }}>{description}</td>
                                            <td style={{ border:'1px solid black',  width: 100, }}>{location.facilityName}</td>
                                            <td className={"td"}><EditIsPublished id={id} checked={isPublished}/></td>
                                            <td style={{ border:'1px solid black',  width: 100, }}>
                                                c: {moment(createdAt).format("M/D/Y")} <br/> u: {moment(updatedAt).format("M/D/Y")}
                                            </td>
                                            <td style={{ border:'1px solid black',  width: 70, }}><RemoveEvent id={id}/></td>
                                            <td style={{ border:'1px solid black',  width: 70, }}><UpdateTheEvent id={id}/></td>
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

export default EventList;