import React, { Component } from "react";
import Home from './Home';
import Game from './Game';
import GameRound from './GameRound';
import { Link, Switch, Route, Redirect } from 'react-router-dom';
import getWeb3 from "./utils/getWeb3";
import Wallet from "./components/wallet"

import Deployments from "./core/sdk/deployments.json"
import AIWarPlatformContract from "./core/build/contracts/AIWarPlatform.json";
import OpenEtherbetGameEventContract from "./core/build/contracts/OpenEtherbetGameEvent.json";
import truffleContract from "truffle-contract";

import "./App.css";

class App extends Component {
    web3 = null;
    platform = null;
    gameEvent = null;

    state = {
        accounts: [],
        initialized: false
    };

    async componentDidMount() {
        try {
            // Get network provider and web3 instance.
            this.web3 = await getWeb3();

            const accounts = await this.web3.eth.getAccounts();

            const networkId = await this.web3.eth.net.getId();
            const deployments = Deployments.networks[networkId];
            if (!deployments) throw new Error(`Contracts not deployed to the network ${networkId}`);
            console.log(`Deployed contracts:`, JSON.stringify(deployments));
            const AIWarPlatform = truffleContract(AIWarPlatformContract);
            AIWarPlatform.setProvider(this.web3.currentProvider);
            this.platform = await AIWarPlatform.at(deployments.AIWarPlatform.deployedAddress);
            const OpenEtherbetGameEvent = truffleContract(OpenEtherbetGameEventContract);
            OpenEtherbetGameEvent.setProvider(this.web3.currentProvider);
            this.gameEvent = await OpenEtherbetGameEvent.at(deployments.OpenEtherbetGameEvent.deployedAddress);

            this.setState({ initialized: true, accounts });
        } catch (error) {
            console.error("App loading error:", error);
        }
    }

    //
    //
    //took out "refreshWallet"

    render() {
        if (!this.state.initialized) {
            return <div>Loading Web3, accounts, and contract...</div>;
        }
        return (
            <Route>
                <div>
                    <Link to="/">
                        <div className="Logo text-center p-4 mb-2 h-18"><img src="logo.png" alt="AiWar.io logo"/></div>
                    </Link>
                    <div className="container">
                        <Switch>
                            <Route exact path="/" render={(props) => <Home {...props} app={this}/>}/>
                            <Route path="/g/:gameAddress" render={(props) => <Game {...props} app={this}/>}/>
                            <Route path="/r/:gameRoundAddress" render={(props) => <GameRound {...props} app={this}/>}/>
                            <Redirect from="/" to="/" />
                        </Switch>
                    </div>
                    {/* removed wallet hmtl
                      ideally wallet should take {children}, with the different sections. This way I can pass it the gamestate*/}
                    <Wallet web3={this.web3} gameEvent={this.gameEvent}/>
                </div>
            </Route>
        );
    }
}

export default App;
