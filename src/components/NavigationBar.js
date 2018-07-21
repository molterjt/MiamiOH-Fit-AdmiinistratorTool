import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { Auth } from 'aws-amplify';



class NavigationBar extends React.Component{
    render(){
        return(
            <Navbar inverse collapseOnSelect>

                    <Navbar.Toggle />

                <Navbar.Collapse>
                    <Nav>
                        <Nav>
                            <NavItem eventKey={1} title={"GroupFitClasses"} href={"/groupfitclasses"}>GroupFitClasses</NavItem>
                        </Nav>
                        <Nav>
                            <NavDropdown eventKey={2} title={"Workouts"} id={"basic-nav-dropdown"}>
                                <MenuItem eventKey={2.1} href={"/workouts"}>Workouts</MenuItem>
                                <MenuItem eventKey={2.2} href={"/exercises"}>Exercises</MenuItem>
                            </NavDropdown>


                            <NavDropdown eventKey={3} title="Users" id="basic-nav-dropdown">
                                <MenuItem eventKey={3.1} href={"/userlist"}>User List</MenuItem>
                                <MenuItem eventKey={3.2} href={"/comments"}>User Comments</MenuItem>
                                <MenuItem divider />
                                <MenuItem eventKey={3.3}>User Data</MenuItem>
                            </NavDropdown>
                            <NavDropdown eventKey={4} title={"Staff"} id={"basic-nav-dropdown"}>
                                <MenuItem eventKey={4.1} href={"/instructors"}>Instructors</MenuItem>
                                <MenuItem eventKey={4.2} href={"/trainers"}>Trainers</MenuItem>
                                <MenuItem eventKey={4.3} href={"/staffImageGallery"}>Staff Image Gallery</MenuItem>
                            </NavDropdown>
                        </Nav>
                        <Nav>
                            <NavItem eventKey={5} title={"Image Gallery"} href={"/imagegallery"}>Image Gallery</NavItem>
                            <NavItem eventKey={6} title={"Events"} href={"/eventList"}>Events</NavItem>
                            <NavDropdown eventKey={7} title={"Marketing"} id={"basic-nav-dropdown"}>
                                <MenuItem eventKey={7.1} href={"/newsItems"}>News-Items</MenuItem>
                                <MenuItem eventKey={7.2} href={"/marketingAds"}>Marketing Ads</MenuItem>
                            </NavDropdown>
                        </Nav>

                    </Nav>
                    <Nav pullRight>
                        <NavItem
                            onClick={() => Auth.signOut()
                                .then(data => {
                                    console.log(data);
                                    Auth.cleanCachedItems();
                                })
                                .catch(err => console.log(err))}
                            href={"/"}
                        >
                            Log Out
                        </NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

        );
    }
}
export default NavigationBar;