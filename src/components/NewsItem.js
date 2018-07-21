import React from 'react';
import {graphql, Query, Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import NavigationBar from './NavigationBar';
import Ionicon from 'react-ionicons';
import Modal from "react-modal";
import axios from "axios/index";
import moment from 'moment';

const album_id = '2Kk4EVi';
const Imgur_Client_Id = '06e18547aec23a5';

const ALL_NEWSITEMS = gql`
    query{
        allNewsItems(orderBy: updatedAt_DESC){
            id
            title
            instructor
            location
            blurb
            imageUrl
            isPublished
            createdAt
            updatedAt
        }
    }
`
const SINGLE_NEWSITEM = gql`
    query($id:ID!){
        NewsItem(id:$id){
            id
            title
            instructor
            location
            blurb
            imageUrl
            isPublished
            createdAt
            updatedAt
        }
    }
`

const DELETE_NEWSITEM = gql`
    mutation deleteNewsItem($id: ID!){
        deleteNewsItem(id:$id){
            id
        }
    }
`

const UPDATE_NEWSITEM = gql`
    mutation($id: ID!,$instructor: String, $title:String, $location: String, $imageUrl:String, $blurb:String){
        updateNewsItem(id:$id, instructor:$instructor, title:$title, location:$location, imageUrl:$imageUrl, blurb:$blurb){
            id
            instructor
            location
            blurb
            imageUrl
            title
        }
    }
`

const CREATE_NEWSITEM = gql`
    mutation($instructor: String, $title:String, $location: String, $imageUrl:String, $blurb:String){
        createNewsItem(instructor:$instructor, title:$title, location:$location, imageUrl:$imageUrl, blurb:$blurb){
            id
            instructor
            location
            blurb
            imageUrl
            title
        }
    }
`

const NEWSITEM_ISPUBLISHED = gql`
    mutation updateIsPublished($id: ID!, $show: Boolean){
        updateNewsItem(id:$id, isPublished: $show){
            isPublished
        }
    }
`

/*******Delete NewsItem**********/
const RemoveNewsItem = ({id}) => {
    return (
        <Mutation
            mutation={DELETE_NEWSITEM}
        >
            {(deleteNewsItem, {data}) => (
                <Ionicon icon="ios-trash" onClick={ () => {
                    if(window.confirm("Are you really, really sure you want to DELETE?  There's no take backs!")){
                        deleteNewsItem({
                            variables: {
                                id
                            },
                            refetchQueries: [ { query: ALL_NEWSITEMS }],
                        });
                        console.log("NewsItem with id: " + id + " was deleted");
                    }
                }} fontSize="35px" color="black"/>
            )}
        </Mutation>
    );
};

/*******Publish NewsItem**********/

const EditIsPublished = ({id, checked}) => {
    return(
        <Mutation mutation={NEWSITEM_ISPUBLISHED}>
            {(updateNewsItem, {data}) => (
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
                                updateNewsItem({
                                    variables: {
                                        id,
                                        show: true
                                    },
                                    refetchQueries: [ { query: ALL_NEWSITEMS, variables: {id} }],
                                });
                                console.log("NewsItem with id: " + id + " was updated to " + true);
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
                                updateNewsItem({
                                    variables: {
                                        id,
                                        show: false
                                    },
                                    refetchQueries: [ { query: ALL_NEWSITEMS, variables: {id} }],
                                });
                                console.log("NewsItem with id: " + id + " was updated to " + false);
                            }
                        }}
                    />
                </form>
            )}
        </Mutation>
    )
};

/*******Update NewsItem**********/
class UpdateNewsItem extends React.Component{
    constructor(props){
        super(props);

        this.state={
            title: undefined,
            instructor: undefined,
            location:undefined,
            blurb: undefined,
            imageUrl: undefined,
            gallery: [],

        };
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this._handleNewsItemUpdateSubmit=this._handleNewsItemUpdateSubmit.bind(this);
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
    _handleNewsItemUpdateSubmit = async (id) => {
        try{
            await this.props.mutate({
                variables:{
                    id: id,
                    title: this.state.title,
                    instructor: this.state.instructor,
                    location:this.state.location,
                    blurb: this.state.blurb,
                    imageUrl: this.state.imageUrl,
                },
                refetchQueries:[
                    {query: ALL_NEWSITEMS}
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
                <Query query={SINGLE_NEWSITEM} variables={{id: this.props.id}}>
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
                                    <h2>Update NewsItem</h2>
                                    <form
                                        style={{textAlign: 'center', marginTop: 30}}
                                        onSubmit={async (e) => {
                                            e.preventDefault();
                                            await this._handleNewsItemUpdateSubmit(data.NewsItem.id);
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
                                                <label>Title:</label>
                                                <br/>
                                                <input
                                                    style={{width: 260, paddingLeft: 10}}
                                                    name={'title'}
                                                    value={this.state.title}
                                                    placeholder={data.NewsItem.title}
                                                    onChange={(e) => this.setState({title: e.target.value})}
                                                />
                                            </div>
                                            <div style={{
                                                backgroundColor: "#f7f9dd",
                                                width: "33.333%",
                                                height: 180,
                                                padding: 10,
                                                border: '1px solid gray'
                                            }}>
                                                <label>Location:</label>
                                                <br/>
                                                <input
                                                    style={{width: 300, paddingLeft: 10}}
                                                    value={this.state.location}
                                                    placeholder={data.NewsItem.location}
                                                    onChange={(e) => this.setState({location: e.target.value})}
                                                />
                                            </div>
                                            <div style={{
                                                backgroundColor: "#f7f9dd",
                                                width: "33.333%",
                                                height: 180,
                                                padding: 10,
                                                border: '1px solid gray'
                                            }}>
                                                <label>Instructor:</label>
                                                <br/>
                                                <input
                                                    style={{width: 240, paddingLeft: 10}}
                                                    value={this.state.instructor}
                                                    placeholder={data.NewsItem.instructor}
                                                    onChange={(e) => this.setState({instructor: e.target.value})}
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
                                                    src={data.NewsItem.imageUrl}
                                                    width={'auto'}
                                                    height={100}
                                                    alt={data.NewsItem.title}
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
                                                    {this.state.gallery.map((obj) => (
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
                                                <label style={{textAlign: 'center', marginRight: 20}}>Blurb:</label>
                                                <br/>
                                                <textarea
                                                    style={{width: 600, padding: 10}}
                                                    rows={5}
                                                    placeholder={data.NewsItem.blurb}
                                                    value={this.state.blurb}
                                                    onChange={(e) => this.setState({blurb: e.target.value})}
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

const UpdateTheNewsItem = graphql(UPDATE_NEWSITEM, {options: { fetchPolicy: 'network-only' }})(UpdateNewsItem);

/*******Create NewsItem**********/
class CreateNewsItem extends React.Component{
    constructor(props){
        super(props);

        this.state={
            title: undefined,
            instructor: undefined,
            location:undefined,
            blurb: undefined,
            imageUrl: undefined,
            gallery: [],

        };
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this._handleNewsItemCreateSubmit=this._handleNewsItemCreateSubmit.bind(this);
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
    _handleNewsItemCreateSubmit = async () => {
        try{
            await this.props.mutate({
                variables:{
                    title: this.state.title,
                    instructor: this.state.instructor,
                    location:this.state.location,
                    blurb: this.state.blurb,
                    imageUrl: this.state.imageUrl,
                },
                refetchQueries:[
                    {query: ALL_NEWSITEMS}
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
                        <h2>Create NewsItem</h2>
                        <form
                            style={{textAlign: 'center', marginTop: 30}}
                            onSubmit={ async(e) => {
                                e.preventDefault();
                                await this._handleNewsItemCreateSubmit();
                                this.closeModal();
                            }}
                        >
                            <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', border: '1px solid gray' }}>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray' }}>
                                    <label>Title:</label>
                                    <br/>
                                    <input
                                        style={{width: 260, paddingLeft: 10}}
                                        name={'title'}
                                        value={this.state.title}
                                        placeholder={'NewsItem Title'}
                                        onChange={ (e) => this.setState({title: e.target.value})}
                                    />
                                </div>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                    <label>Location:</label>
                                    <br/>
                                    <input
                                        style={{width: 240, paddingLeft: 10}}
                                        value={this.state.location}
                                        placeholder = {'Location'}
                                        onChange = {(e) => this.setState({location: e.target.value})}
                                    />
                                </div>
                                <div style={{backgroundColor: "#f7f9dd", width: "33.333%", height: 180, padding:10, border: '1px solid gray'  }}>
                                    <label>Instructor:</label>
                                    <br/>
                                    <input
                                        style={{width: 240, paddingLeft: 10}}
                                        value ={this.state.instructor}
                                        placeholder = {'Instructor'}
                                        onChange = {(e) => this.setState({instructor: e.target.value})}
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

const CreateTheNewsItem = graphql(CREATE_NEWSITEM, {options: { fetchPolicy: 'network-only' }})(CreateNewsItem);

/*******Component NewsItem**********/
class NewsItem extends React.Component{
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
            <Query query={ALL_NEWSITEMS}>
                {({loading, error, data}) => {
                    if(loading) return "Loading...";
                    if(error) return `Errro! ${error.message}`;
                    return(
                        <div>
                            <NavigationBar/>
                            <div style={{display:'flex', flexDirection:'row'}}>
                                <h2 style={{marginLeft:10}}>NewsItem</h2>
                                <CreateTheNewsItem />
                            </div>

                            <div style={{justifyContent:"center", alignItems:"center", marginBottom: 40}}>
                                <table style={{margin: 10, padding: 30, border:'1px solid black', alignItems:"center" }}>
                                    <tbody>
                                    <tr style={{justifyContent:"center", textAlign: 'center'}}>
                                        <th className={"th"}>Image:</th>
                                        <th className={"th"}>Title:</th>
                                        <th className={"th"}>Instructor:</th>
                                        <th className={"th"}>Blurb:</th>
                                        <th className={"th"}>Location:</th>
                                        <th className={"th"}>Published:</th>
                                        <th className={"th"}>Created/Updated:</th>
                                    </tr>
                                    {data.allNewsItems.map(({title, createdAt, updatedAt, instructor, blurb, imageUrl, id, location, isPublished}) => (
                                            <tr key={id} style={{justifyContent:"center", textAlign: 'center'}}>
                                                <td style={{ border:'2px solid black',  width: 200, }}><img style={{height: undefined, width: 'auto'}} src={imageUrl} alt={title} /></td>
                                                <td style={{ border:'1px solid black',  width: 100, }}>{title}</td>
                                                <td style={{ border:'1px solid black',  width: 100, }}>{instructor}</td>
                                                <td style={{ border:'1px solid black',  width: 100, }}>{blurb}</td>
                                                <td style={{ border:'1px solid black',  width: 70, }}>{location}</td>
                                                <td className={"td"}><EditIsPublished id={id} checked={isPublished}/></td>
                                                <td style={{ border:'1px solid black',  width: 100, }}>
                                                    c: {moment(createdAt).format("M/D/Y")} <br/> u: {moment(updatedAt).format("M/D/Y")}
                                                </td>
                                                <td style={{ border:'1px solid black',  width: 70, }}><RemoveNewsItem id={id}/></td>
                                                <td style={{ border:'1px solid black',  width: 70, }}><UpdateTheNewsItem id={id}/></td>
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

export default NewsItem;