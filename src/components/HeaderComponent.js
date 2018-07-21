import React from 'react';
import MiamiFitness from '../MiamiFitness.png';
import MiamiUniversityLogo from '../MiamiUniversityLogo.png'
import Ionicon from 'react-ionicons'


export const HeaderComponent = () => (

    <div className={"App"}>
        <header className="App-header">
            <a href={"/"}>
            <img src={MiamiFitness} className="App-logo" alt="logo" />
            </a>
            <div style={{float: 'right'}}>
                <a href="https://miamioh.edu/rec">
                <img src={MiamiUniversityLogo} style={{height: 20, padding:2, backgroundColor:"white"}} alt="logo" />
                </a>
            </div>
            <div style={{float: 'left'}}>
                <a href="https://www.instagram.com/MiamiUniversityFitness/">
                    <Ionicon
                        icon={"logo-instagram"}
                        color={"white"}
                        fontSize={30}
                    />
                </a>
            </div>
        </header>
    </div>
)