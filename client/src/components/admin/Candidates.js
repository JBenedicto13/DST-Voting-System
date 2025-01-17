import { React, useState, useEffect } from 'react';
import Sidebar from '../admin/Sidebar';
import '../admin/adminStyle/voters.css';
import http from "../../utils/http";
import Swal from 'sweetalert2';
import { ethers } from 'ethers';
// import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
// const docs = [
//     { uri: require("../../../../server/uploads/0x7c561a7e(2)_MailMerge.pdf") },
//     { uri: require("../../../../server/uploads/0x7c561a7e(1)gif.jpg") },
//   ];
// import ElectionSrc from '../../artifacts/contracts/Election.sol/Election.json';
// import { id } from 'ethers/lib/utils';

// const ElectionContract = "0xe42473F1e11418c7D9C6E302E082008D9103D813";

const Candidates = () => {
    //SweetAlert2.0
    
    function successAlert(res) {
        Swal.fire({
            title: "Success",
            text: res,
            icon: "success",
            iconColor: 'var(--maroon)',
            confirmButtonColor: 'var(--maroon)',
            background: 'var(--white)'
        })
    }

    function errorAlert(err) {
        Swal.fire({
            title: "Error",
            text: err,
            icon: "error",
            iconColor: 'var(--maroon)',
            confirmButtonColor: 'var(--maroon)',
            background: 'var(--white)'
        })
    }

    // const [candidateId, setcandidateId] = useState("");
    let candidateId = '';
    // let username;
    // let password;
    // const [lastName, setLastName] = useState("");
    // const [firstName, setfirstName] = useState("");
    // const [course, setCourse] = useState("");
    // const [yearLevel, setYearLevel] = useState("");
    // const [section, setSection] = useState("");
    // const [email, setEmail] = useState("");
    // const [walletAddress, setWalletAddress] = useState("");

    const [electionNameOptions, setelectionNameOptions] = useState([]);
    const [positionOptions, setpositionOptions] = useState([]);
    const [partyListOptions, setpartyListOptions] = useState([]);

    const [electionName, setelectionName] = useState("");
    const [runningPosistion, setrunningPosistion] = useState("");
    const [partyList, setpartyList] = useState("");
    let candidateEmail = '';
    

    // let userList = [];
    const [candidatesList, setcandidatesList] = useState([]);
    const [deploymentData, setdeploymentData] = useState([]);

    //Show Errors
    let showEmail = false;
    let showWalletAddress = false;
    const [showElectionName, setshowElectionName] = useState(false);
    const [showRunningPosition, setshowRunningPosition] = useState(false);
    const [showPartylist, setshowPartylist] = useState(false);

    const [errMsgEN, seterrMsgEN] = useState("");
    const [errMsgRP, seterrMsgRP] = useState("");
    const [errMsgPT, seterrMsgPT] = useState("");

    const [disableSubmit, setDisableSubmit] = useState(true);

    async function loadElectionData() {
        http.get("/election/load")
        .then((res) => {
            setelectionNameOptions(res.data);
        })
        .catch((err) => {
            console.log(err);
        })
    }

    async function loadPositionData(id) {
        try {
            setpositionOptions(electionNameOptions[id-1].positions);
        } catch (error){
            console.log("No Election Selected!");
        }
    }

    async function loadPartylistData(id) {
        try {
            setpartyListOptions(electionNameOptions[id-1].partylists);
        } catch (error){
            console.log("No Election Selected!");
        }
    }
    
    function candidateCheckBlank(isBlank) {
        isBlank = false;
        if (electionName === "") {
            seterrMsgEN("Please select an election");
            setshowElectionName(true);
            isBlank = true;
        }
        if (runningPosistion === "") {
            seterrMsgRP("Please select a position");
            setshowRunningPosition(true);
            isBlank = true;
        }
        if (partyList === "") {
            seterrMsgPT("Please select a partylist");
            setshowPartylist(true);
            isBlank = true;
        }
        
        return isBlank;
    }

/* Validations */

    const electionNameValidation = async () => {
        if (electionName === "") {
            seterrMsgEN("Please select an election");
            setshowElectionName(true);
        } else {
            setshowElectionName(false);
        }
    }

    const runningPositionValidation = async () => {
        if (runningPosistion === "") {
            seterrMsgRP("Please select a position");
            setshowRunningPosition(true);
        } else {
            setshowRunningPosition(false);
        }
    }

    const partyListValidation = async () => {
        if (partyList === "") {
            seterrMsgPT("Please select a partylist");
            setshowPartylist(true);
        } else {
            setshowPartylist(false);
        }
    }
  
    // function validateForm() {
    //     if (showEmail) {
    //         return true;
    //     }
    //     if (showWalletAddress) {
    //         return true;
    //     }
    //     return false;
    // }

/* Validations */

    // function clearForm() {
    //     setLastName("");
    //     setfirstName("");
    //     setCourse("");
    //     setYearLevel("");
    //     setSection("");
    //     setEmail("");
    //     setWalletAddress("");
    //     username = "";
    //     password = "";
    //     setelectionName("");
    //     setrunningPosistion("");
    //     setpartyList("");
    // }

    // const loadUserData = async() => {
    //     await http.get("/user/viewNonCandidate")
    //     .then((res) => userList = res.data)
    //     .catch ((err) => {
    //         if (err.response && err.response.status === 400) {
    //             errorAlert(err);
    //         }
    //     })
    // }

    const loadCandidatesData = async() => {
        await http.get("/user/viewCandidate")
        .then((res) =>  setcandidatesList(res.data))
        .catch ((err) => {
            if (err.response && err.response.status === 400) {
                errorAlert(err);
            }
        })
    }

    const getDeploymentData = async(name) => {
        if (name === "") {
            name = "Nothing Selected";
        }
        await http.post("/user/forDeployment", {electionName: name})
        .then((res) =>  setdeploymentData(res.data))
        .catch ((err) => {
            if (err.response && err.response.status === 400) {
                errorAlert(err);
            }
        })
    }
    //setdeploymentData

    const pendingCandidate = (id) => {
        Swal.fire({
            title: 'Approval',
            text: "Are you sure you want to move this candidate to pending?",
            icon: 'question',
            iconColor: 'var(--maroon)',
            showCancelButton: true,
            confirmButtonColor: 'var(--maroon)',
            cancelButtonColor: 'var(--gold)',
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel',
            background: 'var(--white)'
        }).then((result) => {
            if (result.isConfirmed) {
                http.post("/coc/pending", {id})
                .then((res) => Swal.fire({
                    title: "Success",
                    text: res,
                    icon: "success",
                    iconColor: 'var(--maroon)',
                    showConfirmButton: true,
                    confirmButtonColor: 'var(--maroon)',
                    background: 'var(--white)'
                }).then(window.location.reload()))
                .catch((err) => {
                    if (err.response && err.response.status === 400) {
                        errorAlert(err);
                    }
                })
            }
        })
    }

    const approveCandidate = (id) => {
        Swal.fire({
            title: 'Approval',
            text: "Are you sure you want to approve this candidate?",
            icon: 'question',
            iconColor: 'var(--maroon)',
            showCancelButton: true,
            confirmButtonColor: 'var(--maroon)',
            cancelButtonColor: 'var(--gold)',
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel',
            background: 'var(--white)'
        }).then((result) => {
            if (result.isConfirmed) {
                http.post("/coc/approve", {id})
                .then((res) => Swal.fire({
                    title: "Success",
                    text: res,
                    icon: "success",
                    iconColor: 'var(--maroon)',
                    showConfirmButton: true,
                    confirmButtonColor: 'var(--maroon)',
                    background: 'var(--white)'
                }).then(window.location.reload()))
                .catch((err) => {
                    if (err.response && err.response.status === 400) {
                        errorAlert(err);
                    }
                })
            }
        })
    }

    const disapproveCandidate = (id) => {
        Swal.fire({
            title: 'Approval',
            text: "Are you sure you want to disapprove this candidate?",
            icon: 'question',
            iconColor: 'var(--maroon)',
            showCancelButton: true,
            confirmButtonColor: 'var(--maroon)',
            cancelButtonColor: 'var(--gold)',
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel',
            background: 'var(--white)'
        }).then((result) => {
            if (result.isConfirmed) {
                http.post("/coc/disapprove", {id})
                .then((res) => Swal.fire({
                    title: "Success",
                    text: res,
                    icon: "success",
                    iconColor: 'var(--maroon)',
                    showConfirmButton: true,
                    confirmButtonColor: 'var(--maroon)',
                    background: 'var(--white)'
                }).then(window.location.reload()))
                .catch((err) => {
                    if (err.response && err.response.status === 400) {
                        errorAlert(err);
                    }
                })
            }
        })
    }

    const handleMakeCandidate = () => {
        if (!candidateCheckBlank()) {
            Swal.fire({
                title: 'Are you sure you want to add this candidate?',
                text: "You won't be able to revert this!",
                icon: 'question',
                iconColor: 'var(--maroon)',
                showCancelButton: true,
                confirmButtonColor: 'var(--maroon)',
                cancelButtonColor: 'var(--gold)',
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel',
                background: 'var(--white)'
            }).then((result) => {
                if (result.isConfirmed) {
                    http.post('/user/makeCandidate', {
                        id: candidateId,
                        email: candidateEmail,
                        electionName, 
                        position: runningPosistion, 
                        partyList, 
                        votes: 0
                    })
                    .then((res)=>{
                        successAlert(res)
                        // clearForm()
                        document.getElementById('btnCloseModalCandidate').click()
                        window.location.reload();
                    })
                    .catch((err)=>errorAlert(err))
                }
            })
        }
    }

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [signerContract, setSignerContract] = useState(null);
    const [providerContract, setProviderContract] = useState(null);

    const updateEthers = async (_address, _abi) => {
        const _walletAddress = [];
        const _position = [];

        deploymentData.map((val) => {
            _walletAddress.push(val.walletAddress)
            _position.push(val.candidate[0].position)
        });

        if (typeof window.ethereum != "undefined") {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            // const signerContract = new ethers.Contract(ElectionContract, ElectionSrc.abi, signer);
            // const providerContract = new ethers.Contract(ElectionContract, ElectionSrc.abi, provider);
            const signerContract = new ethers.Contract(_address, _abi, signer);
            const providerContract = new ethers.Contract(_address, _abi, provider);

            setProvider(provider);
            setSigner(signer);
            setProviderContract(providerContract);
            setSignerContract(signerContract);
            addCandidatesToSC(_walletAddress, _position, signerContract);
        }
    }

    const addCandidatesToSC = async (_walletAddress, _position, _signerContract) => {
        var counter = 0;
        await _signerContract.candidateCount()
        .then((res) => {
            counter = parseInt(res, 16);
        })
        await _signerContract.addCandidates(_walletAddress, _position)
        .then((res) => {
            successAlert(res)
        })
        .catch((err) => errorAlert(err))

        deploymentData.map(async (val, key) => {
            counter++;
            await http.post('/user/deployCandidate',{
                id: counter,
                walletAddress: val.walletAddress,
                electionName: val.candidate[0].electionName,
                position: val.candidate[0].position,
                partyList: val.candidate[0].partyList,
                votes: val.candidate[0].votes
            })
            .then((res) => {
                successAlert(res)
            })
            .catch((err) => errorAlert(err))
        })
    }

    const handleDeployCandidates = (title) => {
        var _abi, _address;
        http.post('/election/loadbytitle', {
            title: title,
        })
        .then((res) => {
            _abi = res.data[0].abi;
            _address = res.data[0].address;
        })
        .then(()=>{
            updateEthers(_address, _abi);
        })
        .catch((err) => errorAlert(err))
    }

    const [coclist, setcoclist] = useState([]);

    function getcoc() {
        http.get('/coc/load')
            .then((res) => setcoclist(res.data))
            .catch((err) => console.log(err))
    }

    useEffect(() => {
        // loadUserData()
        loadCandidatesData()
        loadElectionData()
        getcoc()
        
        // if (validateForm() === false) {
        //     setDisableSubmit(false);
        // } else {
        //     setDisableSubmit(true);
        // }
    }, [])

  return (
    <div className='voters'>
        <Sidebar />
        <div className='voters-main-container'>
            <div className='tblVoters'>
                <h2>Pending for Approval</h2>
                <table>
                    <thead>
                    <tr>
                        <th>No.</th>
                        <th>Last Name</th>
                        <th>First Name</th>
                        <th>Election</th>
                        <th>Position</th>
                        <th>Political Party</th>
                        <th className='colActions' colSpan={2}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                        {coclist
                        .filter(approved => approved.approvalStatus === "Pending")
                        .map((val, key) => {
                            return (
                            <tr key={key}>
                                <td>{key + 1}</td>
                                <td>{val.lastName}</td>
                                <td>{val.firstName}</td>
                                <td>{val.election}</td>
                                <td>{val.position}</td>
                                <td>{val.politicalParty}</td>
                                <td className='tdActions'><button onClick={() => disapproveCandidate(val._id)} className='btn btn-danger btnDelete'>Disapprove</button></td>
                                <td className='tdActions'><button onClick={() => approveCandidate(val._id)} className='btn btn-danger btnDelete'>Approve</button></td>
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className='tblVoters'>
                <h2>Inelligible Candidates</h2>
                <table>
                    <thead>
                    <tr>
                        <th>No.</th>
                        <th>Last Name</th>
                        <th>First Name</th>
                        <th>Election</th>
                        <th>Position</th>
                        <th>Political Party</th>
                        <th className='colActions' colSpan={2}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                        {coclist
                        .filter(approved => approved.approvalStatus === "Disapproved")
                        .map((val, key) => {
                            return (
                            <tr key={key}>
                                <td>{key + 1}</td>
                                <td>{val.lastName}</td>
                                <td>{val.firstName}</td>
                                <td>{val.election}</td>
                                <td>{val.position}</td>
                                <td>{val.politicalParty}</td>
                                <td className='tdActions'><button onClick={() => pendingCandidate(val._id)} className='btn btn-danger btnDelete'>Move to Pending</button></td>
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div>
                {/* <DocViewer
                    pluginRenderers={DocViewerRenderers}
                    documents={docs}
                    config={{
                    header: {
                        disableHeader: false,
                        disableFileName: false,
                        retainURLParams: false
                    }
                    }}
                    style={{ height: 500 }}
                /> */}
            </div>
            <div className='tblVoters'>
                <h2>Approved Candidates</h2>
                <table>
                    <thead>
                    <tr>
                        <th>No.</th>
                        <th>Last Name</th>
                        <th>First Name</th>
                        <th>Election</th>
                        <th>Position</th>
                        <th>Political Party</th>
                        <th className='colActions' colSpan={2}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                        {coclist
                        .filter(approved => approved.approvalStatus === "Approved")
                        .map((val, key) => {
                            return (
                            <tr key={key}>
                                <td>{key + 1}</td>
                                <td>{val.lastName}</td>
                                <td>{val.firstName}</td>
                                <td>{val.election}</td>
                                <td>{val.position}</td>
                                <td>{val.politicalParty}</td>
                                <td className='tdActions'><button onClick={() => pendingCandidate(val._id)} className='btn btn-danger btnDelete'>Move to Pending</button></td>
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
                <div className='tfootVoterList'>
                    <button type='button' className='btn btn-warning' data-bs-toggle="modal" data-bs-target="#deployModal">DEPLOY</button>
                </div>
            </div>
            <div className='tblVoters'>
                <h2>DEPLOYED CANDIDATES</h2>
                <table>
                    <thead>
                    <tr>
                        <th>Id</th>
                        <th>Last Name</th>
                        <th>First Name</th>
                        <th>Username</th>
                        <th>Wallet Address</th>
                        <th>Election Name</th>
                        <th>Position</th>
                        <th>Party List</th>
                        <th>Votes</th>
                    </tr>
                    </thead>
                    <tbody>
                        {candidatesList.filter(currentCandidate => currentCandidate.candidate[0].isDeployed === true)
                        .map((val, key) => {
                            return (
                            <tr key={key}>
                                <td>{key+1}</td>
                                <td>{val.lastName}</td>
                                <td>{val.firstName}</td>
                                <td>{val.username}</td>
                                <td>{val.walletAddress}</td>
                                <td>{val.candidate[0].electionName}</td>
                                <td>{val.candidate[0].position}</td>
                                <td>{val.candidate[0].partyList}</td>
                                <td>{val.candidate[0].votes}</td>
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Make Candidate Modal */}
        <div className="modal fade" id="makeCandidateModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="makeCandidateModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title fs-5" id="makeCandidateModalLabel">FILL UP CANDIDATE DATA</h2>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body mx-3">
                    <form>
                        <div className="col mb-3">
                            <label htmlFor='electionName'>Election Name</label>
                            <select value={electionName} 
                                onChange={(e) => {
                                    setelectionName(e.target.value)
                                    loadPositionData(e.target.selectedIndex)
                                    loadPartylistData(e.target.selectedIndex)
                                }} 
                                className="form-select" name="electionName" aria-label="Default select example" onBlur={electionNameValidation}>
                                <option defaultValue="" value="">Select Election Name</option>
                                {electionNameOptions.map((val, key) =><option key={key}>{val.title}</option>)}
                            </select>
                            {showElectionName && <p className='spanErrors'>{errMsgEN}</p>}
                        </div>
                        <div className="col mb-3">
                            <label htmlFor='runningPosition'>Position</label>
                            <select value={runningPosistion} onChange={(e) => setrunningPosistion(e.target.value)} className="form-select" name="runningPosition" aria-label="Default select example" onBlur={runningPositionValidation}>
                                <option defaultValue="" value="">Select Position</option>
                                {positionOptions.map((val, key) =><option key={key}>{val.posTitle}</option>)}
                            </select>
                            {showRunningPosition && <p className='spanErrors'>{errMsgRP}</p>}
                        </div>
                        <div className="col mb-3">
                            <label htmlFor='partyList'>Party List</label>
                            <select value={partyList} onChange={(e) => setpartyList(e.target.value)} className="form-select" name="partyList" aria-label="Default select example" onBlur={partyListValidation}>
                                <option defaultValue="" value="">Select Party List</option>
                                {partyListOptions.map((val, key) =><option key={key}>{val.partylistTitle}</option>)}
                            </select>
                            {showPartylist && <p className='spanErrors'>{errMsgPT}</p>}
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <button id='btnCloseModalCandidate' type="button" className="btn btn-danger" data-bs-dismiss="modal">CLOSE</button>
                    <button type="button"className="btn btn-warning btnAdd" onClick={() => handleMakeCandidate()}>SAVE</button>
                </div>
                </div>
            </div>
        </div>

        {/* Select Election Candidates to Deploy */}
        <div className="modal fade" id="deployModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="deployModalModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title fs-5" id="deployModalModalLabel">DEPLOY CANDIDATES</h2>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body mx-3">
                    <form>
                        <div className="col mb-3">
                            <label htmlFor='electionName'>Election Name</label>
                            <select value={electionName} 
                                onChange={(e) => {
                                    setelectionName(e.target.value)
                                    getDeploymentData(e.target.value)
                                }} 
                                className="form-select" name="electionName" aria-label="Default select example" onBlur={electionNameValidation}>
                                <option defaultValue="" value="">Select Election Name</option>
                                {electionNameOptions.map((val, key) =><option key={key}>{val.title}</option>)}
                            </select>
                            {showElectionName && <p className='spanErrors'>{errMsgEN}</p>}
                        </div>
                        <div className='col mb-3'>
                            <table>
                                <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Username</th>
                                    <th>Position</th>
                                    <th>Party List</th>
                                </tr>
                                </thead>
                                <tbody>
                                    {deploymentData.map((val, key) => {
                                        return (
                                        <tr key={key}>
                                            <td>{key+1}</td>
                                            <td>{val.username}</td>
                                            <td>{val.candidate[0].position}</td>
                                            <td>{val.candidate[0].partyList}</td>
                                        </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <button id='btnCloseModalCandidate' type="button" className="btn btn-danger" data-bs-dismiss="modal">CLOSE</button>
                    <button type="button"className="btn btn-warning btnAdd" onClick={() => handleDeployCandidates(electionName)}>DEPLOY</button>
                </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Candidates