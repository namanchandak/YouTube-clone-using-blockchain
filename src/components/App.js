
import React, { Component } from 'react';
import DVideo from '../abis/DVideo.json'
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';

//Declare IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values





class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    //Load accounts
    const accounts=await  web3.eth.getAccounts();
    console.log(accounts)
    this.setState({account:accounts[0]})
    //Add first account the the state

    //Get network ID
    const networkId= await web3.eth.net.getId()
    const networkData=DVideo.networks[networkId]
    //Get network data
    if(networkData)
    {
      const dvideo=new web3.eth.Contract(DVideo.abi,networkData.address)
      console.log(dvideo)

      
      this.setState({dvideo})
      const videosCount= await dvideo.methods.videoCount().call()
      this.setState({videosCount})
      ///load video sort by newest

      
      for(var i=videosCount;i>=1;i--)
      {
        const video=await dvideo.methods.videos(i).call()
        this.setState({
          videos:[...this.state.videos,video]
        })
      }

      ////set the latest video with title to view as default
      const latest =await dvideo.methods.videos(videosCount).call()
      this.setState({
        currentHash: latest.hash,
        currentTitle: latest.title

      })
      this.setState({
        loading: false
      })

    }
    else
    {
      window.alert('DVideo contract not deployed to detected network.')
    }
    //Check if net data exists, then
    
    // new web3.eth.Contract(DVideo.abi,DVideo.networks[networkId].address)

      //Assign dvideo contract to a variable
      //Add dvideo to the state

      //Check videoAmounts
      //Add videAmounts to the state

      //Iterate throught videos and add them to the state (by newest)


      //Set latest video and it's title to view as default 
      //Set loading state to false

      //If network data doesn't exisits, log error
  }

  //Get video
  captureFile = event => {
    event.preventDefault()
    const file=event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () =>{
      this.setState({buffer :Buffer(reader.result)})
      console.log('buffer ', this.state.buffer)
    }

  }

  //Upload video
  uploadVideo = title => {
    console.log('submitting file to IPFS ...')

    ////add to ipfs

    // ipfs.add(file,callback)
    ipfs.add(this.state.buffer, (error,result)=>{
      ///put on block chain

      console.log('IPFS result', result)
      if(error)
      {
        console.error(error)
        return
      }

      this.setState({loading:true})
      this.state.dvideo.methods.uploadVideo(result[0].hash, title ).send({from : this.state.account}).on('transactionHash',(hash)=>{
        this.setState({loading: false })
      })

    } )
  }

  //Change Video
  changeVideo = (hash, title) => {

  }

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      //set states
      account:'',
      dvideo:null,
      videos:[],
      loading:true,
      currentHash:null,
      currentTitle:null
    }

    //Bind functions
  }

  render() {
    return (
      <div>
        <Navbar 
          //Account
          account={this.state.account  }
        />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              //states&functions
              uploadVideo={this.uploadVideo}
              captureFile={this.captureFile}
              currentHash={this.state.currentHash}
            />
        }
      </div>
    );
  }
}

export default App;