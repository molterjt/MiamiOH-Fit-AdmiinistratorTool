import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import {Auth} from 'aws-amplify';


class RouteController extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            isAuthenticated: false,
            userData: '',
        };
        this.checkAuth = this.checkAuth.bind(this);
    }

    checkAuth = async () =>  {
        await Auth.currentAuthenticatedUser()
            .then(res => {
                console.log(res);
                return true;
            })
            .catch(err => {
                console.log(err);
                return false;
            });
    }

    render(){
        const {component: C, props: cProps, ...rest} = this.props;
        return(
            <Route
                {...rest}
                render={
                    (props) => (
                        cProps.isAuthenticated
                            ? <C {...props} {...cProps} />
                            : <Redirect to={"/"}/>
                    )
                }
            />
        );
    }
}

export default RouteController;







