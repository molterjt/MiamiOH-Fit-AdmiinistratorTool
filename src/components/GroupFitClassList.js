import React from 'react';
import {graphql, Query, Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import Modal from 'react-modal';
import Ionicon from 'react-ionicons'
import NavigationBar from './NavigationBar';
import '../App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TimePicker from 'material-ui/TimePicker';
import DatePicker from 'material-ui/DatePicker';
import moment from 'moment'
import axios from "axios/index";

const album_id = '2Kk4EVi';
const Imgur_Client_Id = '06e18547aec23a5';
//const Imgur_Client_Secrety = '8bfc8ba8c9da2d6afa1aa9aa46f76f22bb204b50';


const DELETE_GFCLASS = gql`
    mutation deleteGroupFitClass($id: ID!){
        deleteGroupFitClass(id:$id){
            id
        }
    }
`

const GF_CLASS_LIST = gql`
    query{
        allGroupFitClasses(orderBy:title_ASC){
            id
            imageUrl
            title
            instructor{firstName, email, id}
            days{name}
            time
            startTime
            endTime
            createdAt
            isPublished
            location{facilityName, id}
            capacity
            description
            category{title, id}
        }
        allDays{id,name},
        allInstructors{id, firstName, lastName email}
        allFacilities{facilityName, id}
    }
`

const SINGLE_GF_CLASS = gql`
    query SingleGroupFitClass($id:ID!){
        GroupFitClass(id:$id){
            id
            title
            time
            imageUrl
            startTime
            endTime
            instructor{firstName, lastName email, id}
            isPublished
            location{facilityName, id}
            capacity
            days{name}
            description
            category{title, id}
        },
        allDays{id,name}
        allInstructors{id, firstName, lastName email}
        allFacilities{facilityName, id}
        allGroupFitnessClassCategories{id, title}
    }
`

const GF_CLASS_ISPUBLISHED = gql`
    mutation updateIsPublished($id: ID!, $show: Boolean){
        updateGroupFitClass(id:$id, isPublished: $show){
            isPublished
        }
    }
`


const UPDATE_GFCLASS = gql`    
    mutation updateGroupFitClassListing($id: ID!, $title: String, $time: String,  $idGFI: ID!, $daysArr: [ID!], $startTime: DateTime, $endTime: DateTime, $description: String, $imageUrl: String, $location: ID, $category: [ID!]) {
        updateGroupFitClass(id: $id, title: $title, time: $time, daysIds: $daysArr, startTime: $startTime, endTime: $endTime, description: $description, imageUrl: $imageUrl, locationId: $location, categoryIds: $category) {
            id
            title
            time
            startTime
            endTime
            imageUrl
            description
            category{title, id}
            location{facilityName, id}
            instructor {
                id
                firstName
            }    
                days {
                    id
                    name
                }
            }
            addToInstructorsClasses(instructorInstructorId: $idGFI, classesGroupFitClassId: $id) {
                classesGroupFitClass {
                    title
                    days {
                        id
                        name
                    }
                    id
                }
                instructorInstructor {
                    firstName
                    id
                }
            }
        }
`

const CREATE_GFCLASS = gql`
    mutation ($title: String!, $time: String!, $daysArr: [ID!], $startTime: DateTime, $endTime: DateTime, $idGFI: ID!, $location: ID, $imageUrl: String, $description: String,) {
        createGroupFitClass(title: $title, time: $time, daysIds: $daysArr, instructorId: $idGFI, locationId: $location, imageUrl: $imageUrl, description: $description,  startTime: $startTime, endTime: $endTime) {
            id
            title
            time
            location {facilityName, id}
            instructor {id, firstName}
            days {id, name}
            description
            startTime
            endTime
        }
    }

`

/******* Publish Status of GroupFitClass **********/

const EditIsPublished = ({id, checked}) => {
    return(
        <Mutation mutation={GF_CLASS_ISPUBLISHED}>
            {(updateGroupFitClass, {data}) => (
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
                                    updateGroupFitClass({
                                        variables: {
                                            id,
                                            show: true
                                        },
                                        refetchQueries: [ { query: SINGLE_GF_CLASS, variables: {id} }],
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
                                    updateGroupFitClass({
                                        variables: {
                                            id,
                                            show: false
                                        },
                                        refetchQueries: [ { query: SINGLE_GF_CLASS, variables: {id} }],
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

/*******Deletes GroupFitClass**********/

const RemoveGFClass = ({id}) => {
    return (
        <Mutation
            mutation={DELETE_GFCLASS}
        >
            {(deleteGroupFitClass, {data}) => (
                <Ionicon icon="ios-trash" onClick={ () => {
                    if(window.confirm("Are you really, really sure you want to DELETE? There's no take backs!")){
                        deleteGroupFitClass({
                            variables: {
                                id
                            },
                            refetchQueries: [ { query: GF_CLASS_LIST }],
                        });
                        console.log("GroupFitClass with id: " + id + " was deleted");
                    }
                }} fontSize="35px" color="black"/>
            )}
        </Mutation>
    );
};

/*******Updates GroupFitClass**********/

class UpdateGroupFitClass extends React.Component{
    constructor(props){
        super(props);

        this.state={
            title: undefined,
            description: undefined,
            displayTime: undefined,
            imageUrl: undefined,
            location: undefined,
            gallery: [],
            startDate: null,
            startTime: null,
            endDate: null,
            endTime: null,
            instructor: '',
            dayCheckBox: false,
            modalIsOpen: false,
            isPublished: false,
            categoryTypes: [],
            checkedDays:[],
            newInstructorSelection:'',
        };
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this._handleClassScheduleCheck=this._handleClassScheduleCheck.bind(this);
        this._handleGroupFitClassUpdateSubmit=this._handleGroupFitClassUpdateSubmit.bind(this);
        this.handleNewInstructorSelection=this.handleNewInstructorSelection.bind(this);
        this._handleChangeEndDate = this._handleChangeEndDate.bind(this);
        this._handleChangeStartDate = this._handleChangeStartDate.bind(this);
        this._handleStartTime = this._handleStartTime.bind(this);
        this._handleEndTime = this._handleEndTime.bind(this);
        this._handleTitleValue = this._handleTitleValue.bind(this);
        this._handleStartEndTimeUpdate = this._handleStartEndTimeUpdate.bind(this);
        this._handleDaysUpdate = this._handleDaysUpdate.bind(this);
        this._handleClassCategoryTypeCheck = this._handleClassCategoryTypeCheck.bind(this);
    }
    _handleChangeStartDate = (event, date) =>{
        let newDate = date;
        console.log("start newDate: " + newDate);
        this.setState({
            startDate: newDate
        });

    };
    _handleChangeEndDate = (event, date) =>{
        let newDate = date;
        console.log("end newDate: " + newDate);
        this.setState({
            endDate: newDate,
        });
    };
    _handleStartTime = (event, time) => {
        this.setState({startTime: time});
    }
    _handleEndTime = (event, time) => {
        this.setState({endTime: time});
    }
    _handleTitleValue(e, valueData){
        this.setState({title: valueData})
    }
    _handleClassScheduleCheck(e){
        let newSelection = e.target.value;
        let newCheckedDayList;

        if(this.state.checkedDays.indexOf(newSelection) > -1){
            newCheckedDayList = this.state.checkedDays.filter(s => s !== newSelection)
        } else {
            newCheckedDayList = [...this.state.checkedDays, newSelection];
        }
        this.setState({checkedDays: newCheckedDayList}, () => console.log('day selection', this.state.checkedDays));
        console.log(this.state.checkedDays)
    }
    _handleClassCategoryTypeCheck(e){
        let newSelection = e.target.value;
        let newCheckedCategoryTypeList;

        if(this.state.categoryTypes.indexOf(newSelection) > -1){
            newCheckedCategoryTypeList = this.state.categoryTypes.filter(s => s !== newSelection)
        } else {
            newCheckedCategoryTypeList = [...this.state.categoryTypes, newSelection];
        }
        this.setState({categoryTypes: newCheckedCategoryTypeList}, () => console.log('category type selection', this.state.categoryTypes));
        console.log(this.state.categoryTypes)
    }

    handleNewInstructorSelection(e) {
        this.setState({ newInstructorSelection: e.target.value }, () => console.log('new instructor', this.state.newInstructorSelection));
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
    _handleStartEndTimeUpdate = async (id) => {
        let classStartTime = moment(this.state.startTime);
        let classStartDate = moment(this.state.startDate);
        let renderStartDateTime = moment({
            year: classStartDate.year(),
            month: classStartDate.month(),
            day: classStartDate.date(),
            hour: classStartTime.hours(),
            minute: classStartTime.minutes(),
            second: 0,
        });
        let classEndTime = moment(this.state.endTime);
        let classEndDate = moment(this.state.endDate);
        let renderEndDateTime = moment({
            year: classEndDate.year(),
            month: classEndDate.month(),
            day: classEndDate.date(),
            hour: classEndTime.hours(),
            minute: classEndTime.minutes(),
            second: 0,
        });

        if(renderStartDateTime !== null && renderEndDateTime !== null){
            let start = moment(renderStartDateTime).toISOString();
            let end = moment(renderEndDateTime).toISOString();

            await this.props.mutate({
                variables:{
                    id:id,
                    startTime: start,
                    endTime: end,
                },
                refetchQueries:[
                    {query: SINGLE_GF_CLASS, variables:{id:id}}
                ]
            })

        }
    };
    _handleDaysUpdate = async (id) => {
        await this.props.mutate({
            variables:{
                id:id,
                idGFI: this.state.newInstructorSelection,
                daysArr: this.state.checkedDays
            },
            refetchQueries:[
                {query: GF_CLASS_LIST}
            ]
        })

    };
    _handleGroupFitClassUpdateSubmit = async (id) => {
        try{
            await this.props.mutate({
                variables:{
                    id: id,
                    idGFI: this.state.newInstructorSelection,
                    title: this.state.title,
                    time: this.state.displayTime,
                    description: this.state.description,
                    imageUrl: this.state.imageUrl,
                    location: this.state.location,
                    category: this.state.categoryTypes,
                },
                refetchQueries:[
                    {query: GF_CLASS_LIST}
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
                    <Query query={SINGLE_GF_CLASS} variables={{id: this.props.id}}>
                        {({loading, error, data}) => {
                            if (loading) return "Loading...";
                            if (error) return `Errro! ${error.message}`;
                            const daysArr = data.allDays;
                            const instructorArr = data.allInstructors;
                            const facilityList = data.allFacilities;
                            const categoryTypeList = data.allGroupFitnessClassCategories;
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
                                            <form
                                                style={{textAlign: 'center', marginTop: 70}}
                                                onSubmit={ async(e) => {
                                                    e.preventDefault();
                                                    await this._handleGroupFitClassUpdateSubmit(data.GroupFitClass.id);
                                                    this.closeModal();
                                                }}
                                            >
                                                <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', border: '1px solid gray' }}>


                                                    <div style={{backgroundColor: "#c2d9c3", width: "33.33%", height: 120, padding:10, border: '1px solid gray' }}>
                                                    <label>Class Title:</label>
                                                    <br/>
                                                    <input
                                                        style={{width: 240}}
                                                        name={'title'}
                                                        value={this.state.title}
                                                        placeholder={data.GroupFitClass.title}
                                                        onChange={ (e) => this.setState({title: e.target.value})}
                                                    />
                                                    </div>

                                                    <div style={{backgroundColor: "#c2d9c3", width: "33.33%", height: 120, padding:10, border: '1px solid gray'  }}>
                                                    <label>Display Time:</label>
                                                    <br/>
                                                    <input
                                                        style={{width: 240}}
                                                        value ={this.state.displayTime}
                                                        placeholder = {data.GroupFitClass.time}
                                                        onChange = {(e) => this.setState({displayTime: e.target.value})}
                                                    />
                                                    </div>

                                                    <div style={{backgroundColor: "#c2d9c3", width: "33.33%",height: 120, padding:10, border: '1px solid gray' }}>
                                                    <label style={{marginLeft:20}}>Select Instructor:</label>
                                                    <br/>
                                                    <select
                                                        name={"Instructors"}
                                                        value={this.state.newInstructorSelection}
                                                        onChange={this.handleNewInstructorSelection}
                                                        defaultChecked={data.GroupFitClass.instructor.id}
                                                        className="form-select"
                                                    >
                                                        <option value={data.GroupFitClass.instructor.id}>{'Current: ' + data.GroupFitClass.instructor.lastName + ', ' + data.GroupFitClass.instructor.firstName}</option>
                                                        {instructorArr.map(opt => {
                                                            return (
                                                                <option key={opt.id} value={opt.id}>
                                                                    {opt.lastName}, {opt.firstName}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                    </div>

                                                    <div style={{backgroundColor: "#c2d9c3", height:250, width: "33.33%", padding:10, border: '1px solid gray' }}>
                                                    <label>Current Image:</label>
                                                    <br/>
                                                    <img
                                                        src={data.GroupFitClass.imageUrl}
                                                        width={160}
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
                                                    <div style={{backgroundColor: "#c2d9c3", width: "33.33%", height: 250, padding:10, border: '1px solid gray' }}>
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
                                                        <option>{data.GroupFitClass.location.facilityName}</option>
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
                                                    <div style={{backgroundColor: "#c2d9c3", width: "33.33%", height: 250, padding:10, border: '1px solid gray' }}>
                                                    <label style={{textAlign: 'center', marginRight: 20}}>Description:</label>
                                                    <br/>
                                                    <textarea
                                                        style={{width: 250}}
                                                        rows={5}
                                                        placeholder={data.GroupFitClass.description}
                                                        value={this.state.description}
                                                        onChange={(e) => this.setState({description: e.target.value})}
                                                    />
                                                    </div>

                                                    <div style={{backgroundColor: "#c2d9c3", width: "100%", height: 50, paddingTop: 40, padding:10}}>
                                                        <label>Current Class Category Types:</label>
                                                        {data.GroupFitClass.category.map(({title}, index) =>
                                                            <label key={index} style={{marginLeft: 10,  padding: 5,
                                                                fontSize: 14, width: 100, color:"#2fa3fa", fontWeight:"normal"}}>{title}</label>
                                                        )}
                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "100%", height: 80, padding:10, display:'flex', flexDirection:'row', textAlign:'center', justifyContent:'center'}}>
                                                        <label >Select New Class Category Types:</label>
                                                        <br />
                                                        {categoryTypeList.map((obj, index) =>
                                                            <div  key={index}>
                                                                <label key={index} style={{marginLeft: 20, fontWeight:"normal"}}>{obj.title}</label>
                                                                <input
                                                                    style={{marginLeft: 10}}
                                                                    type={"checkbox"}
                                                                    value={obj.id}
                                                                    checked={this.state.categoryTypes.indexOf(obj.id) > -1}
                                                                    onChange={this._handleClassCategoryTypeCheck }
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <br/>
                                                <div style={{backgroundColor: "#c2d9c3", border: '1px solid gray', padding: 30}}>
                                                    <div style={{ marginTop: 30,  justifyContent:'center', textAlign:'center', alignContent:'center', alignItems:'center'}}>
                                                        <label>Current Schedule Days:</label>
                                                        {data.GroupFitClass.days.map(({name}, index) =>
                                                            <label key={index} style={{marginLeft: 10,  padding: 5,
                                                                fontSize: 14, width: 100, color:"#2fa3fa", fontWeight:"normal"}}>{name}</label>
                                                        )}
                                                    </div>
                                                    <label className='w-40 pa3 mv2' style={{marginTop: 40}}>Select New Schedule Days:</label>
                                                    <br />
                                                    {daysArr.map((obj, index) =>
                                                        <div style={{display:"inline", }} key={index}>
                                                            <label style={{marginLeft: 20, fontWeight:"normal"}}>{obj.name}</label>
                                                            <input
                                                                style={{marginLeft: 10}}
                                                                type={"checkbox"}
                                                                value={obj.id}
                                                                checked={this.state.checkedDays.indexOf(obj.id) > -1}
                                                                onChange={this._handleClassScheduleCheck }
                                                            />
                                                        </div>
                                                    )}
                                                    <div style={{marginTop: 40}}>
                                                        <button
                                                            className={"btn btn-primary"}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                this._handleDaysUpdate(data.GroupFitClass.id);
                                                            }}>Update Days</button>
                                                    </div>
                                                </div>

                                                <br />
                                                <div style={{backgroundColor: "#c2d9c3", display: 'center', border: "1px gray black",  alignContent:'center', alignItems:'center', textAlign:'center', justifyContent:'center', padding: 30}}>
                                                    <label className='w-40 pa3 mv2'>Publish Date & Time:</label>
                                                        <MuiThemeProvider>
                                                            <div>
                                                                <div style={{ textAlign:'center', justifyContent:'center', flexAlign: 'center', alignItems: 'center'}}>
                                                                    <p style={{color: '#2fa3fa', fontSize: 12}}>Current Start DateTime:  {moment(data.GroupFitClass.startTime).format('M/D/Y')} at {moment(data.GroupFitClass.startTime).format('h:mm a')}</p>
                                                                    <p style={{color: '#2fa3fa', fontSize: 12}}>Current End DateTime:  {moment(data.GroupFitClass.endTime).format('M/D/Y')} at {moment(data.GroupFitClass.endTime).format('h:mm a')}</p>
                                                                </div>
                                                                <div style={{display: 'flex' ,flex: 1, textAlign:'center', justifyContent:'center', flexAlign: 'center', alignItems: 'center'}}>

                                                                    <div style={{display: 'flex', flexDirection: "column"}}>
                                                                    <DatePicker
                                                                        onChange={this._handleChangeStartDate}
                                                                        floatingLabelText={"Start Date"}
                                                                        value={this.state.startDate}
                                                                        firstDayOfWeek={0}
                                                                        className={"col s4 indigo lighten-1 grey-text text-lighten-5"}
                                                                    />
                                                                    <DatePicker
                                                                        onChange={this._handleChangeEndDate}
                                                                        floatingLabelText="End Date"
                                                                        firstDayOfWeek={0}
                                                                        value={this.state.endDate}
                                                                        className={"col s6 light-blue lighten-1 grey-text text-lighten-5"}
                                                                    />
                                                                    </div>
                                                                    <div style={{display: 'flex',  flexDirection: "column", alignItems: 'center', marginLeft: 70}}>
                                                                        <TimePicker
                                                                            style={{fontWeight:"bold", marginTop: 25, fontSize:12, display:'inline'}}
                                                                            hintText={'Start Time'}
                                                                            minutesStep={5}
                                                                            value={this.state.startTime}
                                                                            onChange={this._handleStartTime}
                                                                            floatingLabelText={"Start Time"}
                                                                        />
                                                                        <TimePicker
                                                                            style={{fontWeight:"bold", marginTop: 25, fontSize:12, display:'inline'}}
                                                                            hintText={'End Time'}
                                                                            minutesStep={5}
                                                                            value={this.state.endTime}
                                                                            onChange={this._handleEndTime}
                                                                            floatingLabelText={"End Time"}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div style={{marginTop: 40}}>
                                                                    <button
                                                                        className={"btn btn-primary"}
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            this._handleStartEndTimeUpdate(data.GroupFitClass.id);
                                                                        }}>Update DateTimes</button>
                                                                </div>
                                                            </div>
                                                        </MuiThemeProvider>
                                                    <br />
                                                </div>
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

const UpdateTheGFClass = graphql(UPDATE_GFCLASS, {options: { fetchPolicy: 'network-only' }})(UpdateGroupFitClass);

/*******Creates GroupFitClass**********/

class CreateGroupFitClass extends React.Component{
    constructor(props){
        super(props);
        this.state={
            title: undefined,
            description: undefined,
            displayTime: undefined,
            imageUrl: undefined,
            location: undefined,
            gallery: [],
            startDate: null,
            startTime: null,
            endDate: null,
            endTime: null,
            instructor: '',
            dayCheckBox: false,
            modalIsOpen: false,
            isPublished: false,
            checkedDays:[],
            newInstructorSelection:'',
        };
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this._handleClassScheduleCheck=this._handleClassScheduleCheck.bind(this);
        this._handleGroupFitClassCreateSubmit=this._handleGroupFitClassCreateSubmit.bind(this);
        this.handleNewInstructorSelection=this.handleNewInstructorSelection.bind(this);
        this._handleChangeEndDate = this._handleChangeEndDate.bind(this);
        this._handleChangeStartDate = this._handleChangeStartDate.bind(this);
        this._handleStartTime = this._handleStartTime.bind(this);
        this._handleEndTime = this._handleEndTime.bind(this);
        this._handleTitleValue = this._handleTitleValue.bind(this);
        this._handleStartEndTimeUpdate = this._handleStartEndTimeUpdate.bind(this);
        this._handleDaysUpdate = this._handleDaysUpdate.bind(this);
    }
    _handleChangeStartDate = (event, date) =>{
        let newDate = date;
        console.log("start newDate: " + newDate);
        this.setState({
            startDate: newDate
        });
    };
    _handleChangeEndDate = (event, date) =>{
        let newDate = date;
        console.log("end newDate: " + newDate);
        this.setState({
            endDate: newDate,
        });
    };
    _handleStartTime = (event, time) => {
        this.setState({startTime: time});
    }
    _handleEndTime = (event, time) => {
        this.setState({endTime: time});
    }
    _handleTitleValue(e, valueData){
        this.setState({title: valueData})
    }
    _handleClassScheduleCheck(e){
        let newSelection = e.target.value;
        let newCheckedDayList;

        if(this.state.checkedDays.indexOf(newSelection) > -1){
            newCheckedDayList = this.state.checkedDays.filter(s => s !== newSelection)
        } else {
            newCheckedDayList = [...this.state.checkedDays, newSelection];
        }
        this.setState({checkedDays: newCheckedDayList}, () => console.log('day selection', this.state.checkedDays));
        console.log(this.state.checkedDays)
    }
    handleNewInstructorSelection(e) {
        this.setState({ newInstructorSelection: e.target.value }, () => console.log('new instructor', this.state.newInstructorSelection));
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
    _handleStartEndTimeUpdate = async () => {
        let classStartTime = moment(this.state.startTime);
        let classStartDate = moment(this.state.startDate);
        let renderStartDateTime = moment({
            year: classStartDate.year(),
            month: classStartDate.month(),
            day: classStartDate.date(),
            hour: classStartTime.hours(),
            minute: classStartTime.minutes(),
            second: 0,
        });
        let classEndTime = moment(this.state.endTime);
        let classEndDate = moment(this.state.endDate);
        let renderEndDateTime = moment({
            year: classEndDate.year(),
            month: classEndDate.month(),
            day: classEndDate.date(),
            hour: classEndTime.hours(),
            minute: classEndTime.minutes(),
            second: 0,
        });

        if(renderStartDateTime !== null && renderEndDateTime !== null){
            let start = moment(renderStartDateTime).toISOString();
            let end = moment(renderEndDateTime).toISOString();

            await this.props.mutate({
                variables:{
                    idGFI: this.state.newInstructorSelection,
                    startTime: start,
                    endTime: end,
                },
                refetchQueries:[
                    {query: GF_CLASS_LIST}
                ]
            })

        }
    };
    _handleDaysUpdate = async () => {
        await this.props.mutate({
            variables:{
                idGFI: this.state.newInstructorSelection,
                daysArr: this.state.checkedDays
            },
            refetchQueries:[
                {query: GF_CLASS_LIST}
            ]
        })

    };
    _handleGroupFitClassCreateSubmit = async () => {

        let classStartTime = moment(this.state.startTime);
        let classStartDate = moment(this.state.startDate);
        let renderStartDateTime = moment({
            year: classStartDate.year(),
            month: classStartDate.month(),
            day: classStartDate.date(),
            hour: classStartTime.hours(),
            minute: classStartTime.minutes(),
            second: 0,
        });
        let classEndTime = moment(this.state.endTime);
        let classEndDate = moment(this.state.endDate);
        let renderEndDateTime = moment({
            year: classEndDate.year(),
            month: classEndDate.month(),
            day: classEndDate.date(),
            hour: classEndTime.hours(),
            minute: classEndTime.minutes(),
            second: 0,
        });
        let start = moment(renderStartDateTime).toISOString();
        let end = moment(renderEndDateTime).toISOString();

        await this.props.mutate({
                variables:{
                    idGFI: this.state.newInstructorSelection,
                    title: this.state.title,
                    time: this.state.displayTime,
                    description: this.state.description,
                    imageUrl: this.state.imageUrl,
                    daysArr: this.state.checkedDays,
                    startTime: start,
                    endTime: end,
                    location: this.state.location,

                },
                refetchQueries:[
                    {query: GF_CLASS_LIST}
                ]
            })
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
                        <form
                            style={{textAlign: 'center', marginTop: 70}}
                            onSubmit={ async(e) => {
                                e.preventDefault();
                                await this._handleGroupFitClassCreateSubmit();
                                this.closeModal();
                            }}
                        >
                            <div style={{justifyContent:'center', textAlign:'center', alignContent:'center', }}>
                                <div style={{display: 'flex' ,flex: 1, textAlign:'center', justifyContent:'center', flexAlign: 'center', alignItems: 'center'}}>
                                    <div style={{position: 'center', display: "flex", flexDirection: "row", marginRight: 30, textAlign:'center', justifyContent:'center', flexAlign: 'center', alignItems: 'center'}}>
                                        <label  style={{marginRight: 15, }}>Class Title:</label>
                                        <br/>
                                        <input
                                            style={{width: 240, textAlign: 'center'}}
                                            name={'title'}
                                            value={this.state.title}
                                            placeholder={"title"}
                                            onChange={ (e) => this.setState({title: e.target.value})}
                                        />
                                    </div>
                                    <br/>
                                    <div style={{display: "flex", flexDirection: "row", marginRight: 30, textAlign:'center', justifyContent:'center', flexAlign: 'center', alignContent:'center', alignItems: 'center'}}>
                                        <label  style={{marginRight: 15, }}>Display Time:</label>
                                        <br/>
                                        <input
                                            style={{width: 240, textAlign: 'center'}}
                                            value ={this.state.displayTime}
                                            placeholder = {"time"}
                                            onChange = {(e) => this.setState({displayTime: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <br />
                                <div  style={{marginTop: 20, padding: 20, display: 'flex', flexDirection: "row", textAlign: "center", justifyContent:'center', flexAlign: 'center', alignContent:'center', alignItems: 'center'}}>
                                    <label style={{marginLeft:15}}>Select Instructor:</label>
                                    <select
                                        name={"Instructors"}
                                        value={this.state.newInstructorSelection}
                                        onChange={this.handleNewInstructorSelection}
                                        className="form-select"
                                        style={{marginLeft: 15}}
                                    >
                                        <option>Select Instructor</option>
                                        {this.props.instructorList.map(opt => {
                                            return (
                                                <option key={opt.id} value={opt.id}>
                                                    {opt.lastName}, {opt.firstName}
                                                </option>
                                            );
                                        })}
                                    </select>
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
                                    <label style={{marginLeft: 25, marginRight: 15}}>Location: </label>
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
                                <br/>
                                <div>
                                    <label style={{textAlign: 'center', marginRight: 15}}>Description:</label>
                                    <br/>
                                    <textarea
                                        style={{width: 600}}
                                        rows={3}
                                        placeholder={"Enter Class Description"}
                                        value={this.state.description}
                                        onChange={(e) => this.setState({description: e.target.value})}
                                    />
                                </div>
                                <br />
                                <div style={{border: '1px dotted black', padding: 30}}>

                                    <label className='w-40 pa3 mv2' style={{marginTop: 40}}>Select Schedule Days:</label>
                                    <br />
                                    {this.props.days.map((obj, index) =>
                                        <div style={{display:"inline", }} key={index}>
                                            <label style={{marginLeft: 20, fontWeight:"normal"}}>{obj.name}</label>
                                            <input
                                                style={{marginLeft: 10}}
                                                type={"checkbox"}
                                                value={obj.id}
                                                checked={this.state.checkedDays.indexOf(obj.id) > -1}
                                                onChange={this._handleClassScheduleCheck }
                                            />
                                        </div>
                                    )}
                                </div>
                                <br />
                                <div style={{display: 'center', border: "1px dotted black",  alignContent:'center', alignItems:'center', textAlign:'center', justifyContent:'center', padding: 30}}>
                                    <label className='w-40 pa3 mv2'>Publish Date & Time:</label>

                                    <MuiThemeProvider>
                                        <div>
                                            <div style={{ textAlign:'center', justifyContent:'center', flexAlign: 'center', alignItems: 'center'}}>
                                                <p style={{color: '#acacac', fontSize: 12}}>Start DateTime:  {moment(this.state.startDate).format('M/D/Y')} at {moment(this.state.startTime).format('h:mm a')}</p>
                                                <p style={{color: '#acacac', fontSize: 12}}>End DateTime:  {moment(this.state.endTime).format('M/D/Y')} at {moment(this.state.endTime).format('h:mm a')}</p>
                                            </div>
                                            <div style={{display: 'flex' ,flex: 1, textAlign:'center', justifyContent:'center', flexAlign: 'center', alignItems: 'center'}}>

                                                <div style={{display: 'flex', flexDirection: "column"}}>
                                                    <DatePicker
                                                        onChange={this._handleChangeStartDate}
                                                        floatingLabelText={"Start Date"}
                                                        value={this.state.startDate}
                                                        className={"col s4 indigo lighten-1 grey-text text-lighten-5"}
                                                    />
                                                    <DatePicker
                                                        onChange={this._handleChangeEndDate}
                                                        floatingLabelText="End Date"
                                                        value={this.state.endDate}
                                                        className={"col s6 light-blue lighten-1 grey-text text-lighten-5"}
                                                    />
                                                </div>
                                                <div style={{display: 'flex',  flexDirection: "column", alignItems: 'center', marginLeft: 70}}>
                                                    <TimePicker
                                                        style={{fontWeight:"bold", marginTop: 25, fontSize:12, display:'inline'}}
                                                        hintText={'Start Time'}
                                                        minutesStep={5}
                                                        value={this.state.startTime}
                                                        onChange={this._handleStartTime}
                                                        floatingLabelText={"Start Time"}
                                                    />
                                                    <TimePicker
                                                        style={{fontWeight:"bold", marginTop: 25, fontSize:12, display:'inline'}}
                                                        hintText={'End Time'}
                                                        minutesStep={5}
                                                        value={this.state.endTime}
                                                        onChange={this._handleEndTime}
                                                        floatingLabelText={"End Time"}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </MuiThemeProvider>
                                </div>
                                <br />

                                <br/>

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

const CreateTheGFClass = graphql(CREATE_GFCLASS, {options: { fetchPolicy: 'network-only' }})(CreateGroupFitClass);

/*******Component GroupFitClass**********/

class GroupFitClassList extends React.Component{
    constructor() {
        super();
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
            <Query query={GF_CLASS_LIST}>
                {({loading, error, data}) => {
                    if(loading) return "Loading...";
                    if(error) return `Error! ${error.message}`;

                    return(
                        <div>
                            <NavigationBar/>
                            <div style={{display:'flex', flexDirection:'row', marginLeft: 10}}>
                                <h2>GroupFit Class</h2>
                                <CreateTheGFClass facilityList={data.allFacilities} instructorList={data.allInstructors} days={data.allDays}/>
                            </div>
                            <div >
                                <table style={{margin: 10, padding: 20, }}>
                                    <tbody>
                                    <tr style={{textAlign: 'center'}} >
                                        <th className={"th"}>Image</th>
                                        <th className={"th"}>Title</th>
                                        <th className={"th"}>Display Time</th>
                                        <th className={"th"}>Days</th>
                                        <th className={"th"}>Instructor</th>
                                        <th className={"th"}>Published?</th>
                                        <th className={"th"}>Start DateTime</th>
                                        <th className={"th"}>End DateTime</th>
                                        <th className={"th"}>Location & Type</th>
                                        <th className={"th"}>Description</th>
                                    </tr>
                                {data.allGroupFitClasses.map(({title, time, id, days, instructor, isPublished, imageUrl, startTime, endTime, location, description, category}) => (
                                    <tr key={id}>
                                        <td style={{ border:'2px solid black',  width: 150, textAlign: 'center'}}><img style={{height: 100, width: 160}} src={imageUrl} alt={title} /></td>
                                        <td className={"td"}>{title}</td>
                                        <td className={"td"}>{time}</td>
                                        <td className={"td"}>{days.map(({name}) => name).join(", ")}</td>
                                        <td className={"td"}>{instructor.firstName}</td>
                                        <td className={"td"}><EditIsPublished id={id} checked={isPublished}/></td>
                                        <td className={"td"}>{moment(startTime).format('h:mm a')} <br/><br/> {moment(startTime).format("M/D/Y")}</td>
                                        <td className={"td"}>{moment(endTime).format('h:mm a')} <br/><br/> {moment(endTime).format("M/D/Y")}</td>
                                        <td className={"td"}>{location.facilityName} <br /> <br/>{category.map(({title}) => title).join(', ')}</td>
                                        <td className={"td"}>{description}</td>
                                        <td className={"td"}><RemoveGFClass id={id}/></td>
                                        <td className={"td"}><UpdateTheGFClass id={id}/></td>
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
export default GroupFitClassList;


/*
<label key={id}>
    <input
        type={"text"}
        placeholder={isPublished.toString()}
        onChange={this.changePublishedStatus}
        value={this.state.isPublished}
    />
    <EditIsPublished id={id} publishStatus={this.state.isPublished}/>
</label>
*/
 /* <div>
    <h1>SortTime: </h1>
    <p>{data.GroupFitClass.sortTime}</p>
    <p>{moment(data.GroupFitClass.sortTime).format('h:mm a')}</p>
    <p>StartDate: {moment(this.state.startDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}</p>
    <p>StartDate: {moment(this.state.startDate).toISOString()}</p>
    <p>StartDate: {moment(this.state.startDate).format()}</p>
    <p>Enddate: {moment(this.state.endDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}</p>
    <p>StartTime: {moment(this.state.startTime).format("h:mm:ss a")}</p>
    <p>EndTime: {moment(this.state.endTime).format("h:mm:ss a")}</p>
    <p>StartTime Data: {data.GroupFitClass.startTime}</p>
    <p>EndTime Data: {moment(data.GroupFitClass.endTime).format("h:mm:ss")}</p>
    <p>{this.state.checkedDays.map((obj) => obj).join(', ')}</p>

</div>*/

/*
<div style={{justifyContent:'center', textAlign:'center', alignContent:'center', }}>
                                                    <div style={{display: 'flex' ,flex: 1, textAlign:'center', justifyContent:'center', flexAlign: 'center', alignItems: 'center'}}>
                                                        <div style={{position: 'center', display: "flex", flexDirection: "row", marginRight: 30, textAlign:'center', justifyContent:'center', flexAlign: 'center', alignItems: 'center'}}>
                                                            <label  style={{marginRight: 15, }}>Class Title:</label>
                                                                <br/>
                                                                <input
                                                                    style={{width: 240, textAlign: 'center'}}
                                                                    name={'title'}
                                                                    value={this.state.title}
                                                                    placeholder={data.GroupFitClass.title}
                                                                    onChange={ (e) => this.setState({title: e.target.value})}
                                                                />
                                                        </div>
                                                        <br/>
                                                        <div style={{display: "flex", flexDirection: "row", textAlign:'center', justifyContent:'center', flexAlign: 'center', alignContent:'center', alignItems: 'center'}}>
                                                            <label  style={{marginRight: 15, }}>Display Time:</label>
                                                            <br/>
                                                            <input
                                                                style={{width: 240, textAlign: 'center'}}
                                                                value ={this.state.displayTime}
                                                                placeholder = {data.GroupFitClass.time}
                                                                onChange = {(e) => this.setState({displayTime: e.target.value})}
                                                            />
                                                        </div>
                                                        <br/>
                                                    </div>
                                                    <br />
                                                    <div  style={{marginTop: 20, padding: 20}}>
                                                        <label >Current Instructor:</label>
                                                        <label style={{marginLeft: 10, padding: 5,
                                                            fontSize: 14, width: 100, color:"#acacac", fontWeight:"normal"}}>
                                                            {data.GroupFitClass.instructor.firstName}
                                                        </label>
                                                        <label style={{marginLeft:20}}>Select Instructor:</label>
                                                        <select
                                                            name={"Instructors"}
                                                            value={this.state.newInstructorSelection}
                                                            onChange={this.handleNewInstructorSelection}
                                                            defaultChecked={data.GroupFitClass.instructor.id}
                                                            className="form-select"
                                                            style={{marginLeft: 15}}
                                                        >
                                                            <option value={data.GroupFitClass.instructor.id}>{'Current: ' + data.GroupFitClass.instructor.lastName + ', ' + data.GroupFitClass.instructor.firstName}</option>
                                                            {instructorArr.map(opt => {
                                                                return (
                                                                    <option key={opt.id} value={opt.id}>
                                                                        {opt.lastName}, {opt.firstName}
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <br/>
                                                        <label style={{marginRight: 15, }}>Current Image:</label>
                                                            <img
                                                                src={data.GroupFitClass.imageUrl}
                                                                width={160}
                                                                style={{marginRight: 10}}
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
                                                    <br />
                                                    <div>
                                                        <label style={{marginTop: 20, marginRight: 15}}>Location: </label>
                                                        <select
                                                            name={"location"}
                                                            value={this.state.location}
                                                            onChange={(e) => {
                                                                this.setState({location: e.target.value});
                                                            }}
                                                            className={"form-select"}
                                                        >
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
                                                    <br />
                                                    <div style={{ marginTop: 20,  justifyContent:'center', textAlign:'center', alignContent:'center', alignItems:'center'}}>
                                                        <label>Current Class Category Types:</label>
                                                        {data.GroupFitClass.category.map(({title}, index) =>
                                                            <label key={index} style={{marginLeft: 10,  padding: 5,
                                                                fontSize: 14, width: 100, color:"#acacac", fontWeight:"normal"}}>{title}</label>
                                                        )}
                                                    </div>
                                                    <div style={{display:'flex', flexDirection:'row', textAlign:'center', justifyContent:'center'}}>
                                                        <label style={{marginTop: 20}}>Select New Class Category Types:</label>
                                                        <br />
                                                        {categoryTypeList.map((obj, index) =>
                                                            <div style={{marginTop: 20}} key={index}>
                                                                <label style={{marginLeft: 20, fontWeight:"normal"}}>{obj.title}</label>
                                                                <input
                                                                    style={{marginLeft: 10}}
                                                                    type={"checkbox"}
                                                                    value={obj.id}
                                                                    checked={this.state.categoryTypes.indexOf(obj.id) > -1}
                                                                    onChange={this._handleClassCategoryTypeCheck }
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <br/>
                                                    <div>
                                                        <label style={{textAlign: 'center', marginRight: 20, marginTop: 15}}>Description:</label>
                                                        <br/>
                                                        <textarea
                                                            style={{width: 500}}
                                                            rows={3}
                                                            placeholder={data.GroupFitClass.description}
                                                            value={this.state.description}
                                                            onChange={(e) => this.setState({description: e.target.value})}
                                                        />
                                                    </div>
                                                    <div style={{border: '1px dotted black', padding: 30}}>
                                                        <div style={{ marginTop: 30,  justifyContent:'center', textAlign:'center', alignContent:'center', alignItems:'center'}}>
                                                            <label>Current Schedule Days:</label>
                                                            {data.GroupFitClass.days.map(({name}, index) =>
                                                                <label key={index} style={{marginLeft: 10,  padding: 5,
                                                                    fontSize: 14, width: 100, color:"#acacac", fontWeight:"normal"}}>{name}</label>
                                                            )}
                                                        </div>
                                                        <label className='w-40 pa3 mv2' style={{marginTop: 40}}>Select New Schedule Days:</label>
                                                        <br />
                                                        {daysArr.map((obj, index) =>
                                                            <div style={{display:"inline", }} key={index}>
                                                                <label style={{marginLeft: 20, fontWeight:"normal"}}>{obj.name}</label>
                                                                <input
                                                                    style={{marginLeft: 10}}
                                                                    type={"checkbox"}
                                                                    value={obj.id}
                                                                    checked={this.state.checkedDays.indexOf(obj.id) > -1}
                                                                    onChange={this._handleClassScheduleCheck }
                                                                />
                                                            </div>
                                                        )}
                                                        <div style={{marginTop: 40}}>
                                                            <button
                                                                className={"btn btn-primary"}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    this._handleDaysUpdate(data.GroupFitClass.id);
                                                                }}>Update Days</button>
                                                        </div>

                                                    </div>
* */