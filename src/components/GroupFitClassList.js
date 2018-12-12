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
import {sortBy} from "lodash";

const album_id = '2Kk4EVi';
const Imgur_Client_Id = '06e18547aec23a5';
//const Imgur_Client_Secrety = '8bfc8ba8c9da2d6afa1aa9aa46f76f22bb204b50';


const CLASS_DESCRIPTION = [
    {
        title: "Cardio Blast",
        description: "Prepare to sweat with forms of cardio ranging from cycling, rowing, using BOSU's, jump ropes, and various other pieces of equipment. The sky is the limit with this class! If you like variety, this class is for you!",
    },
    {
        title: "Spinning®",
        description: "A motivating group environment, intense training and music that begs your legs to pedal. You’ll find yourself having a blast while you ride your way to a leaner, stronger body. Towel and water bottle required for all classes. New patrons are encouraged to arrive at least 10 minutes prior to the start of class to go over correct bike set-up with the instructor.",
    },
    {
        title: "Kickboxing",
        description: "Kick and punch towards your goals. Juice up speed, strength, and agility with this intense and fun class. A high energy blend of kicks and punches built into combinations and set to upbeat music. This “kick-butt” workout is a great blend of martial arts, boxing, and cardio.",
    },
    {
        title: "Throwdown Thursday Spinning®",
        description: "Two of your favorite artists will battle it out every Thursday. Artists will face each other song by song against their peers, rivals, or frenemies in this high-energy, interval-style Spinning® class. Past battles have included Katy Perry and Taylor Swift, and Madonna and George Michael. Get ready to sweat, sing, and have a great time!",
    },
    {
        title: "ZUMBA®",
        description: "Zumba fuses hypnotic Latin rhythms and easy to follow moves to create a dynamic workout system that will blow you away. The routines feature interval training sessions where fast and slow rhythms and resistance training are combined to tone and sculpt your body."
    },
    {
        title: "Indo-Row®",
        description: "Join us for this unique indoor rowing workout where you will learn proper body mechanics of rowing by using your lower body, core and upper body to break a sweat while having fun. You will work in teams, with a partner, and as one crew to provide a great overall body workout. This class is perfect for all fitness levels. Come see why they call this the Perfect Calorie Burn!",
    },
    {
        title: "SilverSneakers® Classic",
        description: "The classes program is designed to improve agility, balance, coordinator and incorporates daily living activities to improve overall health and well-being.",
    },
    {
        title: "SilverSneakers® Circuit",
        description: "Combine fun with fitness to increase your cardiovascular and muscular endurance power with a standing circuit workout. Upper-body strength work with hand-held weights, elastic tubing with handles, and a SilverSneakers® ball, alternating low-impact aerobics choreography. A chair is used for standing support, stretching, and relaxation exercises.",
    },
    {
        title: "SilverSneakers® Yoga",
        description: "Throughout the class participants will focus on poses and posture to improve breathing, flexibility, balance, muscular strength and endurance, and joint range of motion.",
    },
    {
        title: "Vinyasa Yoga 1",
        description: "This class focuses on the alignment/form of individual postures. Basic postures are held for longer periods of time to explore the refinements of aligning the body, and the class usually includes a restorative posture. Anyone new to yoga or wishing to explore the basics in more detail in a slow flowing yoga class will find Vinyasa Yoga 1 a good starting point. ",
    },
    {
        title: "Vinyasa Yoga 2",
        description: "This class introduces more sun salutations and more challenging postures than Vinyasa Yoga 1. It can also include an alignment segment focusing on one posture or a featured emphasis among several postures. Prior yoga experience useful but not needed. Suitable for people who are moderately fit.",
    },
    {
        title: "Vinyasa Yoga 3",
        description: "A vigorous practice that builds on the other Vinyasa classes and involves more complicated sequences and more challenging arm balances and inversions. Prior yoga experience is highly recommended.",
    },
    {
        title: "Yoga Pilates",
        description: "This class combines the best of Pilates and Vinyasa Yoga to provide both the strength, flexibility, and balance that yoga develops along with the isolated core work that Pilates offers. Prior experience in yoga or pilates is recommended.",
    },
    {
        title: "Bootcamp",
        description: "Workouts are designed to improve your overall fitness with exercises meant challenge your strength, cardiovascular ability, flexibility, agility, and endurance. Bootcamp will utilize different exercise equipment, including your own body. This total body workout will leave you feeling like you've accomplished something great!   ",
    },
    {
        title: "Kettlebell",
        description: "Learn the basic movements and compound exercises to build functional strength and muscular endurance, in addition to enhancing your mobility and metabolic conditioning. This will be challenging but accessible to all levels of fitness. No previous kettlebell experience is required.",
    },
    {
        title: "TRX® Total Body",
        description: "Born in the Navy SEALs, TRX Suspension Training® is a revolutionary method of leveraged bodyweight exercise to develop strength, balance, flexibility, and core stability simultaneously. Be in control of the intensity by adjusting your body position to increase or decrease resistance and work your body in a whole new way.",
    },
    {
        title: "Hard Core Abs",
        description: "Feel like you can’t do another sit-up? Bend, twist, and plank you way to a stronger core and six-pack abs! ",
    },
    {
        title: "Tabata Bootcamp",
        description: " Based on the popular Tabata training practice, this high-intensity interval training class (HIIT) involves a repeating pattern of 20 seconds of maximum cardio work followed by 10 seconds of rest. A wide-array of exercises are included that can be modified to accommodate all fitness levels. Get ready to sweat and push it to the next max!  ",
    },
    {
        title: "Total Body Tone",
        description: "This full body, non-aerobic class is designed to improve muscular strength and endurance using body bars, BOSU balance trainers, dumbbells, stability balls, resistance tubes and more! Modifications will be given to accommodate all fitness levels.",
    },
    {
        title: "Functional Fitness",
        description: "Follows a similar format to CrossFit & embraces some of the same foundations that community builds upon. Each class features a variety of barbell, kettlebell, body-weight, and dumbbell exercises that are scalable to meet challenges of a wide variety of fitness levels. Beginners need to ask questions and focus on technique starting out."
    },
    ];

const SORTED_CLASS_DESCRIPTION = sortBy(CLASS_DESCRIPTION, "title");


const DELETE_GFCLASS = gql`
    mutation deleteGroupFitClass($id: ID!){
        deleteGroupFitClass(id:$id){
            id
        }
    }
`

const GF_CLASS_LIST = gql`
    query($searchTitle:String, $daySearch:String, $instructorSearch: String, $seasonSearch:String){
        allGroupFitClasses(
            filter:{
                title_contains:$searchTitle 
                days_some:{name_contains: $daySearch}
                instructor:{firstName_contains: $instructorSearch}
                season_contains:$seasonSearch
            }orderBy:title_ASC){
            id
            imageUrl
            title
            instructor{firstName, email, id}
            days(orderBy: name_DESC){name}
            time
            cancelled
            startTime
            endTime
            season
            createdAt
            isPublished
            location{facilityName, id}
            capacity
            description
            category{title, id}
        }
        allDays{id,name},
        allInstructors(orderBy: firstName_ASC){id, firstName, lastName email}
        allFacilities{facilityName, id}
        allGroupFitnessClassCategories{id, title}
    }
`

const SINGLE_GF_CLASS = gql`
    query SingleGroupFitClass($id:ID!){
        GroupFitClass(id:$id){
            id
            title
            time
            imageUrl
            cancelled
            startTime
            endTime
            season
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

const GF_CLASS_ISCANCELLED = gql`
    mutation updateIsCancelled($id: ID!, $cancelled: Boolean){
        updateGroupFitClass(id:$id, cancelled: $cancelled){
            cancelled
        }
    }
`


const UPDATE_GFCLASS = gql`    
    mutation updateGroupFitClassListing($id: ID!, $title: String, $time: String,  $idGFI: ID!, $daysArr: [ID!], $startTime: DateTime, $endTime: DateTime, $description: String, $imageUrl: String, $location: ID, $category: [ID!], $season:String) {
        updateGroupFitClass(id: $id, title: $title, time: $time, daysIds: $daysArr, startTime: $startTime, endTime: $endTime, description: $description, imageUrl: $imageUrl, locationId: $location, categoryIds: $category, season: $season) {
            id
            title
            time
            startTime
            endTime
            imageUrl
            description
            season
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
    mutation ($title: String!, $time: String!, $daysArr: [ID!], $startTime: DateTime, $endTime: DateTime, $idGFI: ID!, $location: ID, $imageUrl: String, $description: String, $category: [ID!], $season:String ) {
        createGroupFitClass(title: $title, time: $time, daysIds: $daysArr, instructorId: $idGFI, locationId: $location, imageUrl: $imageUrl, description: $description,  startTime: $startTime, endTime: $endTime, categoryIds: $category, season:$season) {
            id
            title
            time
            location {facilityName, id}
            instructor {id, firstName}
            days {id, name}
            category{title, id}
            description
            startTime
            endTime
            season
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

/******* Cancellation Status of GroupFitClass **********/

const EditIsCancelled = ({id, checked}) => {
    return(
        <Mutation mutation={GF_CLASS_ISCANCELLED}>
            {(updateGroupFitClass, {data}) => (
                <form style={{flexDirection: 'column', display: 'flex', alignItems: 'center', justifyContent:'center'}}>
                    <label style={{flexDirection: 'row', display:'flex'}}>Yes
                    <input
                        style={{marginLeft: 5}}
                        type={"checkbox"}
                        name={"True"}
                        value={true}
                        checked={checked === true}
                        onChange={ e => {
                            if(window.confirm("Do you want to show that the class is cancelled?")){
                                updateGroupFitClass({
                                    variables: {
                                        id,
                                        cancelled: true
                                    },
                                    refetchQueries: [ { query: SINGLE_GF_CLASS, variables: {id} }],
                                });
                                console.log("GroupFitClass with id: " + id + " was cancelled.");
                            }
                        }}
                    />
                    </label>
                    <label >No
                    <input
                        style={{marginLeft: 8}}
                        type={"checkbox"}
                        value={false}
                        checked={checked === false}
                        name={"False"}
                        onChange={ e => {
                            if(window.confirm("Do you want to show the class as uncancelled?")){
                                updateGroupFitClass({
                                    variables: {
                                        id,
                                        cancelled: false
                                    },
                                    refetchQueries: [ { query: SINGLE_GF_CLASS, variables: {id} }],
                                });
                                console.log("GroupFitClass with id: " + id + " is no longer cancelled");
                            }
                        }}
                    />
                    </label>
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
            season: undefined,
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
                {query: GF_CLASS_LIST},
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
                    season: this.state.season,
                },
                refetchQueries:[
                    {query: GF_CLASS_LIST,},
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
                                                        defaultChecked={data.GroupFitClass.instructor ? data.GroupFitClass.instructor.id : "unassigned" }
                                                        className="form-select"
                                                    >

                                                        {data.GroupFitClass.instructor
                                                            ? (<option value={data.GroupFitClass.instructor.id}>
                                                                    {'Current: ' + data.GroupFitClass.instructor.firstName + ' ' + data.GroupFitClass.instructor.lastName}
                                                                </option>)
                                                            : (<option>{'unassigned'}</option>)
                                                        }
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
                                                        {imageList.map((obj) => (
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
                                                        <label>Season: </label>
                                                        <br/>
                                                        <input
                                                            style={{width: 240}}
                                                            name={'season'}
                                                            value={this.state.season}
                                                            placeholder={data.GroupFitClass.season}
                                                            onChange={ (e) => this.setState({season: e.target.value})}
                                                        />

                                                    </div>
                                                    <div style={{backgroundColor: "#c2d9c3", width: "33.33%", height: 250, padding:10, border: '1px solid gray' }}>
                                                    <label style={{textAlign: 'center', marginRight: 20}}>Description:</label>
                                                    <br/>
                                                    <select
                                                        name={"description"}
                                                        className={"form-select"}
                                                        style={{width: 300}}
                                                        value={this.state.description}
                                                        onChange={(e) => {this.setState({description: e.target.value})}}
                                                    >
                                                        <option>Select Class-Description</option>
                                                        {SORTED_CLASS_DESCRIPTION.map((obj, index) =>
                                                            <option key={index} value={obj.description}>
                                                                {obj.title}
                                                            </option>
                                                        )}

                                                    </select>
                                                    <br/>
                                                    <label style={{textAlign: 'center', marginRight: 20}}>... or enter your own</label>
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

const UpdateTheGFClass = graphql(UPDATE_GFCLASS, {options: {fetchPolicy: 'network-only'}})(UpdateGroupFitClass);

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
            season: undefined,
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
            categoryTypes: [],
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
                    category: this.state.categoryTypes,
                    season: this.state.season,

                },
                refetchQueries:[
                    {query: GF_CLASS_LIST}
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
                                    <div style={{position: 'center', display: "flex", flexDirection: "row", marginRight: 30, textAlign:'center', justifyContent:'center', flexAlign: 'center', alignItems: 'center'}}>
                                        <label  style={{marginRight: 15, }}>Class Season:</label>
                                        <br/>
                                        <input
                                            style={{width: 240, textAlign: 'center'}}
                                            name={'season'}
                                            value={this.state.season}
                                            placeholder={"season"}
                                            onChange={ (e) => this.setState({season: e.target.value})}
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
                                                    {opt.firstName} {opt.lastName}
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
                                        {imageList.map((obj) => (
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
                                    <select
                                        name={"description"}
                                        className={"form-select"}
                                        style={{width: 300}}
                                        value={this.state.description}
                                        onChange={(e) => {this.setState({description: e.target.value})}}
                                    >
                                        <option>Class-Descriptions</option>
                                        {SORTED_CLASS_DESCRIPTION.map((obj, index) =>
                                            <option key={index} value={obj.description}>
                                                {obj.title}
                                            </option>
                                        )}

                                    </select>
                                    <br/>
                                    <label style={{textAlign: 'center', marginRight: 15}}>... or enter your own</label>
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

                                    <label className='w-40 pa3 mv2' style={{marginTop: 20}}>Select Schedule Days:</label>
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
                                <div style={{  border: "1px dotted black", padding:30, textAlign:'center', justifyContent:'center',  marginBottom: 20}}>

                                    <label >Select Class Category Types:</label>
                                    <div style={{ display:'flex', flexDirection: 'row', marginTop: 20, textAlign: 'center', justifyContent: 'center'}}>
                                        <br />
                                        {this.props.categoryList.map((obj, index) =>
                                            <div style={{display: 'inline'}} key={index}>
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
                                                        className={"col s4 light-blue lighten-1 grey-text text-lighten-5"}
                                                    />
                                                </div>
                                                <div style={{display: 'flex',  flexDirection: "column", alignItems: 'center', marginLeft: 70}}>
                                                    <TimePicker
                                                        style={{fontWeight:"bold",  fontSize:12, display:'inline'}}
                                                        hintText={'Start Time'}
                                                        minutesStep={5}
                                                        value={this.state.startTime}
                                                        onChange={this._handleStartTime}
                                                        floatingLabelText={"Start Time"}
                                                    />
                                                    <TimePicker
                                                        style={{fontWeight:"bold", fontSize:12, }}
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
            searchTitle: undefined,
            daySearch: undefined,
            instructorSearch: undefined,
            seasonSearch: undefined,
        };
        this.changePublishedStatus = this.changePublishedStatus.bind(this);
    }
    changePublishedStatus(){
        this.setState({isPublished: !this.state.isPublished});
    }
    render(){
        return(
            <div>
                <NavigationBar/>
                <div style={{flexDirection:'row', display:'flex'}}>
                    <div style={{flexDirection: 'row',backgroundColor: "#000", width: "20%", height: 'auto', padding:8, border: '1px solid gray' }}>
                        <input
                            style={{width: '100%', paddingLeft: 10}}
                            name={'Class Search'}
                            value={this.state.searchTitle}
                            placeholder={'Search Class By Title'}
                            onChange={ (e) => this.setState({searchTitle: e.target.value})}
                        />
                    </div>
                    <div style={{flexDirection: 'row',backgroundColor: "#000", width: "20%", height: 'auto', padding:8, border: '1px solid gray' }}>
                        <input
                            style={{width: '100%', paddingLeft: 10}}
                            name={'Day Search'}
                            value={this.state.daySearch}
                            placeholder={'Search Class By Day'}
                            onChange={ (e) => this.setState({daySearch: e.target.value})}
                        />
                    </div>
                    <div style={{flexDirection: 'row',backgroundColor: "#000", width: "20%", height: 'auto', padding:8, border: '1px solid gray' }}>
                        <input
                            style={{width: '100%', paddingLeft: 10}}
                            name={'Instructor Search'}
                            value={this.state.instructorSearch}
                            placeholder={'Search Class By Instructor First Name'}
                            onChange={ (e) => this.setState({instructorSearch: e.target.value})}
                        />
                    </div>
                    <div style={{flexDirection: 'row',backgroundColor: "#000", width: "20%", height: 'auto', padding:8, border: '1px solid gray' }}>
                        <input
                            style={{width: '100%', paddingLeft: 10}}
                            name={'Season Search'}
                            value={this.state.seasonSearch}
                            placeholder={'Search Class By Season'}
                            onChange={ (e) => this.setState({seasonSearch: e.target.value})}
                        />
                    </div>
                </div>
            <Query query={GF_CLASS_LIST} variables={{searchTitle:this.state.searchTitle, daySearch:this.state.daySearch, instructorSearch:this.state.instructorSearch, seasonSearch:this.state.seasonSearch}}>
                {({loading, error, data}) => {
                    if(loading) return "Loading...";
                    if(error) return `Error! ${error.message}`;

                    return(
                        <div>
                            <div style={{display:'flex', flexDirection:'row', marginLeft: 10}}>
                                <h2>GroupFit Class</h2>
                                <CreateTheGFClass facilityList={data.allFacilities} instructorList={data.allInstructors} days={data.allDays} categoryList={data.allGroupFitnessClassCategories}/>
                            </div>
                            <div >
                                <table style={{margin: 10, padding: 20, }}>
                                    <tbody>
                                    <tr style={{textAlign: 'center'}} >
                                        <th className={"th"}>Image</th>
                                        <th className={"th"}>Title</th>
                                        <th className={"th"}>Display Time</th>
                                        <th className={"th"}>Cancel</th>
                                        <th className={"th"}>Days</th>
                                        <th className={"th"}>Instructor</th>
                                        <th className={"th"}>Published?</th>
                                        <th className={"th"}>Start DateTime</th>
                                        <th className={"th"}>End DateTime</th>
                                        <th className={"th"}>Location & Type</th>
                                        <th className={"th"}>Description</th>
                                        <th className={"th"}>Season</th>
                                    </tr>
                                {data.allGroupFitClasses.map(({title, time, id, days, instructor, cancelled, isPublished, imageUrl, startTime, endTime, location, description, category,season}) => (
                                    <tr key={id}>
                                        <td style={{ border:'2px solid black',  width: 150, textAlign: 'center'}}><img style={{height: 100, width: 160}} src={imageUrl} alt={title} /></td>
                                        <td className={"td"}>{title}</td>
                                        <td className={"td"}>{time}</td>
                                        <td className={"td"}><EditIsCancelled id={id} checked={cancelled}/></td>
                                        <td className={"td"}>{days.map(({name}) => name).join(", ")}</td>
                                    {instructor === null
                                        ? (<td className={"td"}>{"un-assigned"}</td>)
                                        : ( <td className={"td"}>{instructor.firstName}</td>)
                                    }

                                        <td className={"td"}><EditIsPublished id={id} checked={isPublished}/></td>
                                        <td className={"td"}>{moment(startTime).format('h:mm a')} <br/><br/> {moment(startTime).format("M/D/Y")}</td>
                                        <td className={"td"}>{moment(endTime).format('h:mm a')} <br/><br/> {moment(endTime).format("M/D/Y")}</td>
                                        <td className={"td"}>{location.facilityName} <br /> <br/>{category.map(({title}) => title).join(', ')}</td>
                                        <td className={"td"}>{description}</td>
                                        <td className={"td"}>{season}</td>
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
            </div>
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