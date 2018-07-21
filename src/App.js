import React, {Component} from 'react';
import Amplify, {Auth} from 'aws-amplify';
import {withAuthenticator} from 'aws-amplify-react';
import Routes from './Routes';
import aws_exports from './aws-exports';
import {withRouter} from 'react-router-dom';
import {HeaderComponent} from './components/HeaderComponent';

Amplify.configure(aws_exports);

let user;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            loggedIn: false,
            isAuthenticated: false,
            isAuthenticating: true,
        };
        this.getUser = this.getUser.bind(this);
        this.loginSubmit = this.loginSubmit.bind(this);
    }

    userHasAuthenticated = authenticated => {
        this.setState({isAuthenticated: authenticated});
    }

    loginSubmit = async (u, p) => {
        await Auth.signIn(u, p)
            .then(res => {
                console.log(res);
                this.setState({isAuthenticated: true})
            })
            .catch(err => console.log(err));
    };

    getUser = async () => {
        user = await Auth.currentAuthenticatedUser();
        let p = await Auth.currentUserCredentials();
        let m = await Auth.currentSession();
        console.log(m);
        console.log(p.expireTime);
        console.log(user.username);
        return await user.username;
    }

    async componentDidMount() {
        try {
            if (await Auth.currentAuthenticatedUser()) {
                this.userHasAuthenticated(true);
            }
        } catch (e) {
            console.log(e);
        }
        this.setState({isAuthenticating: false});
    }

    render() {
        const childProps = {
            isAuthenticated: this.state.isAuthenticated
        };
        return(
            !this.state.isAuthenticating &&
            <div>
                <HeaderComponent/>
                {!this.state.isAuthenticated
                    ?
                    <div style={{alignContent:'center', backgroundColor: "black"}}>
                        <form
                            style={{padding: 10, textAlign: 'center'}}
                            onSubmit={async (e) => {
                                e.preventDefault();
                                await this.loginSubmit(this.state.username, this.state.password);
                                await Auth.currentSession()
                                    .then(res => {
                                        console.log(res);
                                        this.setState({isAuthenticated: true})
                                    })
                                    .catch(err => alert(err + " Use approved credentials"));
                            }
                            }
                        >
                            <input
                                style={{width: 180}}
                                type={'text'}
                                placeholder={'username'}
                                onChange={(e) => {
                                    e.preventDefault();
                                    this.setState({username: e.target.value})
                                }}
                            />
                            <input
                                style={{marginLeft: 20, width: 180}}
                                type={'password'}
                                placeholder={'password'}

                                onChange={(e) => {
                                    e.preventDefault();
                                    this.setState({password: e.target.value})
                                }}
                            />
                            <button
                                style={{marginLeft: 15}}
                                type={'submit'}
                            >Log In
                            </button>
                        </form>
                    </div>
                    :
                    <Routes childProps={childProps}/>
                }
            </div>

        );
    }
}

export default withRouter(App);


