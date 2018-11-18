import React  from 'react';
import '../App.css'
import axios from 'axios';
import NavigationBar from './NavigationBar';
import Modal from 'react-modal';
import Ionicon from 'react-ionicons'
import {GridList, GridTile} from 'material-ui/GridList';
import Subheader from 'material-ui/Subheader';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {_, sortBy} from 'lodash';

const album_id = '2Kk4EVi';
const Imgur_Client_Id = '06e18547aec23a5';
//const Imgur_Client_Secrety = '8bfc8ba8c9da2d6afa1aa9aa46f76f22bb204b50';


const SORTS = {
    TITLE: list => sortBy(list, 'title')
};

const styles = {
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginBottom: 50
    },
    gridList: {
        width: 900,
        height: 700,
        flexWrap: 'wrap',
        overflowY: 'auto',
    },
};


class ImageGallery extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            gallery: [],
            modalIsOpen: false,
            linkExpand: undefined
        }
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this.expandImageLink = this.expandImageLink.bind(this);
    };

    openModal() {
        this.setState({modalIsOpen: true});
    }
    closeModal() {
        this.setState({modalIsOpen: false});
    }
    expandImageLink(value){
        this.setState({linkExpand: value})
    }

    componentDidMount() {
        Modal.setAppElement('body');
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


    render(){
        const imageList = sortBy(this.state.gallery, "title");
        return(
            <div>
                <NavigationBar/>

                <div style={styles.root}>

                    <MuiThemeProvider>
                        <GridList
                            cellHeight={180}
                            style={styles.gridList}
                            cols={3}
                        >
                            <Subheader>Photo Gallery (Imgur)</Subheader>
                            {imageList.map((obj) => (
                                <GridTile
                                    key={obj.id}
                                    title={obj.title}
                                    subtitle={<span><b>{obj.description}</b></span>}
                                >
                                    <button
                                        onClick={() => {
                                            this.openModal()
                                            this.expandImageLink(obj.link)
                                        }}
                                    >
                                        <img src={obj.link} alt={"GroupFitClass Gallery"} />
                                    </button>
                                </GridTile>
                            ))}
                        </GridList>
                        <Modal
                            isOpen={this.state.modalIsOpen}
                            onRequestClose={this.closeModal}
                            style={{width: 500, height: 500}}
                        >
                            <div className={"pull-right"}>
                                <Ionicon
                                    icon="ios-close-circle-outline"
                                    onClick={this.closeModal}
                                    fontSize="45px"
                                    color="blue"
                                />
                            </div>
                            <img
                                src={this.state.linkExpand}
                                width={"70%"}
                                alt={"expanded GroupFitClass"}
                            />
                        </Modal>
                    </MuiThemeProvider>
                </div>
            </div>


        );
    }
}

export default ImageGallery;

