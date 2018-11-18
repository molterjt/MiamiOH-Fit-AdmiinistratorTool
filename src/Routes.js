import React from 'react'
import {Switch, Route} from 'react-router-dom';
import UserLIst from "./components/UserLIst";
import Home from './components/Home';
import MarketingAd from "./components/MarketingAd";
import EventList from "./components/EventList";
import StaffImageGallery from "./components/StaffImageGallery";
import NewsItem from "./components/NewsItem";
import ImageGallery from "./components/ImageGallery";
import WorkoutList from "./components/WorkoutList";
import CommentList from "./components/CommentList";
import TrainerList from "./components/TrainerList";
import InstructorList from "./components/InstructorList";
import NotFound from "./components/NotFound";
import ExerciseList from "./components/ExerciseList";
import GroupFitClassList from "./components/GroupFitClassList";
import FacilityList from './components/FacilityList';
import UserCheckInList from './components/UserCheckInList';
import RouteController from './components/RouteController';


export default ({childProps}) =>
    <Switch>
        <RouteController  path='/' exact component={Home} props={childProps}/>
        <RouteController path={'/workouts'} exact component={WorkoutList} props={childProps}/>
        <RouteController  path={'/exercises'} exact component={ExerciseList} props={childProps}/>
        <RouteController  path={'/groupfitclasses'} exact component={GroupFitClassList} props={childProps} />
        <RouteController  path={'/userlist'} exact component={UserLIst} props={childProps}/>
        <RouteController  path={'/usercheckinlist'} exact component={UserCheckInList} props={childProps}/>
        <RouteController  path={'/comments'} exact component={CommentList} props={childProps}/>
        <RouteController  path={'/instructors'} exact component={InstructorList} props={childProps}/>
        <RouteController  path={'/trainers'} exact component={TrainerList} props={childProps}/>
        <RouteController  path={'/imageGallery'} exact component={ImageGallery} props={childProps}/>
        <RouteController  path={'/staffImageGallery'} exact component={StaffImageGallery} props={childProps}/>
        <RouteController  path={'/eventList'} exact component={EventList} props={childProps}/>
        <RouteController  path={'/newsItems'}  exact component={NewsItem} props={childProps}/>
        <RouteController  path={'/marketingAds'} exact component={MarketingAd} props={childProps}/>
        <RouteController  path={'/facilityList'} exact component={FacilityList} props={childProps}/>



        <Route component={NotFound}/>
    </Switch>