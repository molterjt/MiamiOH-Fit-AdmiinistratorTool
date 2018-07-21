import React from 'react';
import NavigationBar from './NavigationBar';
import {Query} from 'react-apollo';
import gql from 'graphql-tag';
import moment from 'moment';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import WeightsBackground from '../weights-background.jpg'



let imgStyle = {
    root: {
        backgroundImage: `url(${WeightsBackground})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: "cover",
        height: 1000,
        justifyContent: "center",
    },
    container: {
        boxSizing: "border-box",
        padding: 10,
        width: 800,
        height: 800,
        backgroundColor: "#fff"
    }
};

const DATA_QUERY = gql`
    query{
        allUsers(last:5){createdAt}
        _allUsersMeta(last:5){count}
        allComments{updatedAt}
        _allCommentsMeta{count}
        _allGroupFitClassesMeta(filter: {isPublished: true}){count}
    }
`

const line_data = [
    {name: 'Page A', uv: 4000, pv: 2400, amt: 2400},
    {name: 'Page B', uv: 3000, pv: 1398, amt: 2210},
    {name: 'Page C', uv: 2000, pv: 9800, amt: 2290},
    {name: 'Page D', uv: 2780, pv: 3908, amt: 2000},
    {name: 'Page E', uv: 1890, pv: 4800, amt: 2181},
    {name: 'Page F', uv: 2390, pv: 3800, amt: 2500},
    {name: 'Page G', uv: 3490, pv: 4300, amt: 2100},
];

export default class Home extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            chartData: [],
        }
    }
    render(){
        return(
            <div style={{backgroundColor:"black"}}>
                <NavigationBar/>
                <div style={imgStyle.root}>
                    <h1 style={{
                        color: "#fff",
                        textAlign: "center",
                        borderColor: "#red",
                        textShadow: "-1px 2px 10px rgba(0, 0, 0, 0.75)"
                    }}>
                     Fitness Mobile App Control Center
                    </h1>
                    <Query query={DATA_QUERY}>
                        {({loading, error, data}) => {
                            if (loading) return "Loading...";
                            if (error) return `Errro! ${error.message}`;
                            const userData = data.allUsers;
                            return (
                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                    <LineChart width={400} height={400} data={line_data} style={{
                                        opacity: '0.7',
                                        backgroundColor: "#000",
                                        width: 'auto',
                                        marginRight: 15
                                    }}
                                               margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                                        <XAxis dataKey="name"/>
                                        <YAxis/>
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <Tooltip/>
                                        <Legend/>
                                        <Line type="monotone" dataKey="pv" stroke="red" activeDot={{r: 8}}/>
                                        <Line type="monotone" dataKey="uv" stroke="#82ca9d"/>
                                    </LineChart>
                                    <br/>

                                    <div style={{
                                        opacity: '0.7',
                                        backgroundColor: "#000",
                                        width: 200,
                                        textAlign: 'center',
                                        padding: 5
                                    }}>
                                        <h3 style={{marginTop: 10, color: "#fff"}}>Registered Users</h3>
                                        <h4 style={{
                                            color: "#fff",
                                            border: "1px solid white",
                                            alignSelf: 'center'
                                        }}>{data._allUsersMeta.count}</h4>
                                        <br/>
                                        <h3 style={{marginTop: 10, color: "#fff"}}>User Comments</h3>
                                        <h4 style={{
                                            color: "#fff",
                                            border: "1px solid white",
                                            alignSelf: 'center',
                                            padding: 5
                                        }}>{data._allCommentsMeta.count}</h4>
                                        <br/>
                                        <h3 style={{marginTop: 10, color: "#fff"}}>Published GroupFit
                                            Classes</h3>
                                        <h4 style={{
                                            color: "#fff",
                                            border: "1px solid white",
                                            alignSelf: 'center',
                                            padding: 5
                                        }}>{data._allGroupFitClassesMeta.count}</h4>
                                    </div>
                                    <div style={{
                                        opacity: '0.7',
                                        backgroundColor: "#000",
                                        width: 200,
                                        textAlign: 'center',
                                        padding: 5
                                    }}>
                                        {userData.map((obj, index) => (
                                            <p key={index}
                                               style={{color: "white"}}>{index + 1} {moment(obj.createdAt).format('M/D/Y')}</p>
                                        ))}
                                    </div>
                                    <LineChart width={400} height={400} data={data.allUsers} style={{
                                        opacity: '0.7',
                                        backgroundColor: "#000",
                                        width: 'auto',
                                        marginRight: 15
                                    }}
                                               margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                                        <XAxis dataKey={data.allUsers.index}/>
                                        <YAxis dataKey={"createdAt"}/>
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <Tooltip/>
                                        <Legend/>
                                        <Line type="monotone" dataKey={"createdAt"} stroke="red"/>
                                    </LineChart>
                                </div>
                            );
                        }}
                    </Query>
                </div>
            </div>
        );

    }
}
