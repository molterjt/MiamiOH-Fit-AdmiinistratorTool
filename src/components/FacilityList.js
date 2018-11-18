import React from 'react';
import {graphql, Query, Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import NavigationBar from './NavigationBar';
import Ionicon from 'react-ionicons';
import Modal from "react-modal";
import axios from "axios/index";
import moment from 'moment';
import {sortBy} from "lodash";

const album_id = 'Em3x3iE';
const Imgur_Client_Id = '06e18547aec23a5';

const ALL_FACILITY = gql`
    query{
        allFacilities{
            id
            buildingName
            facilityName
            hours
            open
            imageUrl
            createdAt
            updatedAt
            classes{title, time, days{name}}
            description
        }
    }
`
const SINGLE_FACILITY = gql`
    query($id:ID!){
        Facility(id:$id){
            id
            buildingName
            facilityName
            hours
            open
            imageUrl
            createdAt
            updatedAt
            classes{title, time, days{name}}
            description
        }
    }
`

const DELETE_FACILITY = gql`
    mutation deleteFactility($id: ID!){
        deleteFacility(id:$id){
            id
        }
    }
`

const UPDATE_FACILITY = gql`
    mutation($id: ID!,$facilityName: String, $buildingName:String, $hours: String, $imageUrl:String, $description:String){
        updateFacility(id:$id, facilityName:$facilityName, buildingName:$buildingName, hours:$hours, imageUrl:$imageUrl, description:$description){
            id
            facilityName
            buildingName
            hours
            imageUrl
            description
            open
        }
    }
`

const CREATE_FACILITY = gql`
    mutation($facilityName: String, $buildingName:String, $hours: String, $imageUrl:String, $blurb:String){
        createFacility(facilityName:$facilityName, buildingName:$buildingName, hours:$hours, imageUrl:$imageUrl, description:$blurb){
            id
            facilityName
            buildingName
            hours
            imageUrl
            description
        }
    }
`

const IS_OPEN = gql`
    mutation updateIsOpen($id: ID!, $open: Boolean){
        updateFacility(id:$id, open: $open){
            open
        }
    }
`

/*******Delete Facility**********/
const RemoveFacility = ({id}) => {
    return (
        <Mutation
            mutation={DELETE_FACILITY}
        >
            {(deleteFacility, {data}) => (
                <Ionicon icon="ios-trash" onClick={ () => {
                    if(window.confirm("Are you really, really sure you want to DELETE?  There's no take backs!")){
                        deleteFacility({
                            variables: {
                                id
                            },
                            refetchQueries: [ { query: ALL_FACILITY }],
                        });
                        console.log("Facility with id: " + id + " was deleted");
                    }
                }} fontSize="35px" color="black"/>
            )}
        </Mutation>
    );
};

/*******Publish Facility**********/

const EditIsOpen = ({id, checked}) => {
    return(
        <Mutation mutation={IS_OPEN}>
            {(updateFacility, {data}) => (
                <form style={{flexDirection: "row"}}>
                    <label>Yes</label>
                    <input
                        style={{marginLeft: 5}}
                        type={"radio"}
                        name={"True"}
                        value={true}
                        checked={checked === true}
                        onChange={ e => {
                            if(window.confirm("Do you want to set to open?")){
                                updateFacility({
                                    variables: {
                                        id,
                                        open: true
                                    },
                                    refetchQueries: [ { query: ALL_FACILITY, variables: {id} }],
                                });
                                console.log("Facility with id: " + id + " was updated to " + true);
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
                            if(window.confirm("Do you want to set facility to close?")){
                                updateFacility({
                                    variables: {
                                        id,
                                        open: false
                                    },
                                    refetchQueries: [ { query: ALL_FACILITY, variables: {id} }],
                                });
                                console.log("Facility with id: " + id + " was updated to " + false);
                            }
                        }}
                    />
                </form>
            )}
        </Mutation>
    )
};

/*******Update Facility**********/
class UpdateFacility extends React.Component{
    constructor(props){
        super(props);

        this.state={
            facilityName: undefined,
            buildingName: undefined,
            hours:undefined,
            description: undefined,
            imageUrl: undefined,
            gallery: [],

        };
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this._handleFacilityUpdateSubmit=this._handleFacilityUpdateSubmit.bind(this);
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
    _handleFacilityUpdateSubmit = async (id) => {
        try{
            await this.props.mutate({
                variables:{
                    id: id,
                    facilityName: this.state.facilityName,
                    buildingName: this.state.buildingName,
                    hours:this.state.hours,
                    description: this.state.description,
                    imageUrl: this.state.imageUrl,
                },
                refetchQueries:[
                    {query: ALL_FACILITY}
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
                <Query query={SINGLE_FACILITY} variables={{id: this.props.id}}>
                    {({loading, error, data}) => {
                        if (loading) return "Loading...";
                        if (error) return `Errro! ${error.message}`;
                        return (
                            <div style={{justifyContent: 'center', textAlign: 'center', alignContent: 'center'}}>
                                <Modal isOpen={this.state.modalIsOpen} onRequestClose={this.closeModal}>
                                    <div className={"pull-right"}>
                                        <Ionicon
                                            icon="ios-close-circle-outline"
                                            onClick={this.closeModal}
                                            fontSize="45px"
                                            color="blue"
                                        />
                                    </div>
                                    <h2>Update Facility</h2>
                                    <form
                                        style={{textAlign: 'center', marginTop: 30}}
                                        onSubmit={async (e) => {
                                            e.preventDefault();
                                            await this._handleFacilityUpdateSubmit(data.Facility.id);
                                            this.closeModal();
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            flexWrap: 'wrap',
                                            border: '1px solid gray'
                                        }}>
                                            <div style={{
                                                backgroundColor: "#f7f9dd",
                                                width: "33.333%",
                                                height: 180,
                                                padding: 10,
                                                border: '1px solid gray'
                                            }}>
                                                <label>FacilityName:</label>
                                                <br/>
                                                <input
                                                    style={{width: 260, paddingLeft: 10}}
                                                    name={'facilityName'}
                                                    value={this.state.title}
                                                    placeholder={data.Facility.facilityName}
                                                    onChange={(e) => this.setState({facilityName: e.target.value})}
                                                />
                                            </div>
                                            <div style={{
                                                backgroundColor: "#f7f9dd",
                                                width: "33.333%",
                                                height: 180,
                                                padding: 10,
                                                border: '1px solid gray'
                                            }}>
                                                <label>BuildingName:</label>
                                                <br/>
                                                <input
                                                    style={{width: 300, paddingLeft: 10}}
                                                    value={this.state.buildingName}
                                                    placeholder={data.Facility.buildingName}
                                                    onChange={(e) => this.setState({buildingName: e.target.value})}
                                                />
                                            </div>
                                            <div style={{
                                                backgroundColor: "#f7f9dd",
                                                width: "33.333%",
                                                height: 180,
                                                padding: 10,
                                                border: '1px solid gray'
                                            }}>
                                                <label>Hours:</label>
                                                <br/>
                                                <input
                                                    style={{width: 240, paddingLeft: 10}}
                                                    value={this.state.hours}
                                                    placeholder={data.Facility.hours}
                                                    onChange={(e) => this.setState({hours: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            flexWrap: 'wrap',
                                            border: '1px solid gray'
                                        }}>
                                            <div style={{
                                                backgroundColor: "#f7f9dd",
                                                width: "33.333%",
                                                height: 180,
                                                padding: 10,
                                                border: '1px solid gray'
                                            }}>
                                                <label> Image:</label>
                                                <br/>
                                                <img
                                                    src={data.Facility.imageUrl}
                                                    width={'auto'}
                                                    height={100}
                                                    alt={data.Facility.facilityName}
                                                    style={{marginRight:10, marginBottom:10}}
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
                                            <div style={{
                                                backgroundColor: "#f7f9dd",
                                                width: "66.666%",
                                                height: 180,
                                                padding: 10,
                                                border: '1px solid gray'
                                            }}>
                                                <label style={{textAlign: 'center', marginRight: 20}}>Description:</label>
                                                <br/>
                                                <textarea
                                                    style={{width: 600, padding: 10}}
                                                    rows={5}
                                                    placeholder={data.Facility.description}
                                                    value={this.state.description}
                                                    onChange={(e) => this.setState({description: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <br/>
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

                        );
                    }}
                </Query>
            </div>
        );
    }
}

const UpdateTheFacility = graphql(UPDATE_FACILITY, {options: { fetchPolicy: 'network-only' }})(UpdateFacility);

/*******Create Facility**********/
class CreateFacility extends React.Component{
    constructor(props){
        super(props);

        this.state={
            facilityName: undefined,
            buildingName: undefined,
            hours:undefined,
            blurb: undefined,
            imageUrl: undefined,
            gallery: [],

        };
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this._handleFacilityCreateSubmit=this._handleFacilityCreateSubmit.bind(this);
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
    _handleFacilityCreateSubmit = async () => {
        try{
            await this.props.mutate({
                variables:{
                    facilityName: this.state.facilityName,
                    buildingName: this.state.buildingName,
                    hours:this.state.hours,
                    blurb: this.state.blurb,
                    imageUrl: this.state.imageUrl,
                },
                refetchQueries:[
                    {query: ALL_FACILITY}
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
                        <h2>Create Facility</h2>
                        <form
                            style={{textAlign: 'center', marginTop: 30}}
                            onSubmit={ async(e) => {
                                e.preventDefault();
                                await this._handleFacilityCreateSubmit();
                                this.closeModal();
                            }}
                        >
                            <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', border: '1px solid gray' }}>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray' }}>
                                    <label>FacilityName:</label>
                                    <br/>
                                    <input
                                        style={{width: 260, paddingLeft: 10}}
                                        name={'facility name'}
                                        value={this.state.facilityName}
                                        placeholder={'NewsItem Title'}
                                        onChange={ (e) => this.setState({facilityName: e.target.value})}
                                    />
                                </div>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                    <label>BuildingName:</label>
                                    <br/>
                                    <input
                                        style={{width: 240, paddingLeft: 10}}
                                        value={this.state.buildingName}
                                        placeholder = {'building name'}
                                        onChange = {(e) => this.setState({buildingName: e.target.value})}
                                    />
                                </div>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                    <label>Hours:</label>
                                    <br/>
                                    <input
                                        style={{width: 240, paddingLeft: 10}}
                                        value ={this.state.hours}
                                        placeholder = {'hours'}
                                        onChange = {(e) => this.setState({hours: e.target.value})}
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
                                        {imageList.map((obj) => (
                                            <option key={obj.id} value={obj.link}>
                                                {obj.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{backgroundColor: "#f7f9dd", width: "66.666%", height: 180, padding:10, border: '1px solid gray' }}>
                                    <label style={{textAlign: 'center', marginRight: 20}}>Blurb:</label>
                                    <br/>
                                    <textarea
                                        style={{width: 600, padding:10}}
                                        rows={5}
                                        placeholder={'Blurb'}
                                        value={this.state.blurb}
                                        onChange={(e) => this.setState({ blurb: e.target.value})}
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
    }
}

const CreateTheFacility = graphql(CREATE_FACILITY, {options: { fetchPolicy: 'network-only' }})(CreateFacility);

/*******Component Facility**********/
class FacilityList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            isOpen: null,
        };
        this.changePublishedStatus = this.changePublishedStatus.bind(this);
    }
    changePublishedStatus(){
        this.setState({isOpen: !this.state.isOpen});
    }
    render(){
        return(
            <Query query={ALL_FACILITY}>
                {({loading, error, data}) => {
                    if(loading) return "Loading...";
                    if(error) return `Errro! ${error.message}`;
                    return(
                        <div>
                            <NavigationBar/>
                            <div style={{display:'flex', flexDirection:'row'}}>
                                <h2 style={{marginLeft:10}}>Facility</h2>
                                <CreateTheFacility />
                            </div>

                            <div style={{justifyContent:"center", alignItems:"center", marginBottom: 40}}>
                                <table style={{margin: 10, padding: 30, border:'1px solid black', alignItems:"center" }}>
                                    <tbody>
                                    <tr style={{justifyContent:"center", textAlign: 'center'}}>
                                        <th className={"th"}>Image:</th>
                                        <th className={"th"}>FacilityName:</th>
                                        <th className={"th"}>BuildingName:</th>
                                        <th className={"th"}>Blurb:</th>
                                        <th className={"th"}>Hours:</th>
                                        <th className={"th"}>Open:</th>
                                        <th className={"th"}>Created/Updated:</th>
                                    </tr>
                                    {data.allFacilities.map(({facilityName, createdAt, updatedAt, buildingName, description, imageUrl, id, hours, open}) => (
                                            <tr key={id} style={{justifyContent:"center", textAlign: 'center'}}>
                                                <td style={{ border:'2px solid black',  width: 200, }}><img style={{height: undefined, width: 'auto'}} src={imageUrl} alt={'facility image'} /></td>
                                                <td style={{ border:'1px solid black',  width: 100, }}>{facilityName}</td>
                                                <td style={{ border:'1px solid black',  width: 100, }}>{buildingName}</td>
                                                <td style={{ border:'1px solid black',  width: 100, }}>{description}</td>
                                                <td style={{ border:'1px solid black',  width: 70, }}>{hours}</td>
                                                <td className={"td"}><EditIsOpen id={id} checked={open}/></td>
                                                <td style={{ border:'1px solid black',  width: 100, }}>
                                                    c: {moment(createdAt).format("M/D/Y")} <br/> u: {moment(updatedAt).format("M/D/Y")}
                                                </td>
                                                <td style={{ border:'1px solid black',  width: 70, }}><RemoveFacility id={id}/></td>
                                                <td style={{ border:'1px solid black',  width: 70, }}><UpdateTheFacility id={id}/></td>
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

export default FacilityList;