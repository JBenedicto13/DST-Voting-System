import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import http from "../../utils/http";
import "../../styles/reglogForm.css";
import Swal from "sweetalert2";

const Login = ({user}) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    //Show Errors
    const [showEmail, setShowEmail] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    let showError = false;
   
    const [errMsgE, setErrMsgE] = useState("");
    const [errMsgP, setErrMsgP] = useState("");
    let errMsg = "";
    
    const [error, setError] = useState(null);
    const [disableSubmit, setDisableSubmit] = useState(true);

// Close Open Modals
    const handleClose = () => {
        document.getElementById("staticBackdrop").style.display = "none";
        document.getElementById("staticBackdrop").classList.remove("show");
    }
    const handleShow = () => {
        document.getElementById("staticBackdrop").style.display = "block";
        document.getElementById("staticBackdrop").classList.add("show");
    }

    const handleCloseWallet = () => {
        document.getElementById("walletNotFound").style.display = "none";
        document.getElementById("walletNotFound").classList.remove("show");
    }
// Close Open Modals

    let navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate(-1);
        }
        if (validateForm() === false) {
            setDisableSubmit(false);
        } else {
            setDisableSubmit(true);
        }
    },[user, navigate])

    function checkBlank(isBlank) {
        isBlank = false;
        if (email === "") {
            setErrMsgE("Please enter your email");
            setShowEmail(true);
            isBlank = true;
        }
        if (password === "") {
            setErrMsgP("Please enter a password");
            setShowPassword(true);
            isBlank = true;
        }
        return isBlank;
    }

    const checkExpiry = async (e) => {
        e.preventDefault();
        await http.post("/user/expiry", {email: "2019988131@dhvsu.edu.ph"})
            .then((exp) => {

                const currentDate = new Date();
                const year = currentDate.getFullYear();
                
                var isExpire = (parseInt(exp.data.expirationDate) < parseInt(year));

                if (isExpire === true) {
                    Swal.fire({
                        title: "Account Expired",
                        text: "If you think this is a mistake, please contact the administrator",
                        icon: "error",
                        iconColor: 'var(--maroon)',
                        confirmButtonColor: 'var(--maroon)',
                        background: 'var(--white)'
                    })
                } else {
                    handleSubmit()
                }
            })
            .catch((err) => console.log(err))
    }

    const handleSubmit = async () => {

        if (!checkBlank()) {
            try {
                await http.post("/auth", {
                    email,
                    password
                })
                .then((res) => {
                    localStorage.setItem("token", res)
                    http.post("/user/getEmail", {email})
                       .then((wallet) => {
                        sessionStorage.setItem('user-wallet', wallet)
                        window.location = "/"
                       })
                       .catch((err) => console.log(err));     
                })
                
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    setShowPassword(true);
                    setErrMsgP(error.response.data)
                }
            }
        }

    };


/* Validations */
  var emailValidator = require('validator');
    //Regex
    function dhvsuEmailRegex(input) {
      let regex = /\d*(@dhvsu.edu.ph)/i;
      return regex.test(input);
    }
    const emailValidation = async () => {
        if (email === "") {
            setErrMsgE("Please enter your email");
            setShowEmail(true);
        } else {
            var emailValidity = emailValidator.isEmail(email);
            var dhvsuValidity = dhvsuEmailRegex(email);
            if (emailValidity && dhvsuValidity) {
                setShowEmail(false);
            } else {
                setErrMsgE("Please enter a valid DHVSU Email Address");
                setShowEmail(true);
            }
        }
    }

    const passwordValidation = async () => {
      if (password === "") {
        setErrMsgP("Please enter a password");
        setShowPassword(true);
      } else {
        setShowPassword(false);
      }
    }
  
    function validateForm() {
        if (showEmail) {
            return true;
        }
        if (showPassword) {
            return true;
        }
        return false;
    }

/* Validations */

/* Web3 */
    const [walletButton, setWalletButton] = useState("Connect Wallet");

    const networks = {
        mumbai: {
          chainId: `0x${Number(80001).toString(16)}`,
          chainName: "Mumbai Testnet",
          nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18
          },
          rpcUrls: ["https://matic-mumbai.chainstacklabs.com"],
          blockExplorerUrls: ["https://mumbai.polygonscan.com"]
        }
      };

    const requestAccount = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        
        verifyWallet(account);
    }

    const changeNetwork = async ({ networkName, setError }) => {
        try {
          if (!window.ethereum) throw new Error("No crypto wallet found");
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                ...networks[networkName]
              }
            ]
          }).then(handleClose());
        } catch (err) {
          setError(err.message);
        }
    };

    const handleNetworkSwitch = async (networkName) => {
        setError();
        await changeNetwork({ networkName, setError });
    };

    const connectWallet = async (e) => {
        e.preventDefault();
        if (typeof window.ethereum !== 'undefined') {
            await requestAccount();
            handleNetworkSwitch("mumbai");
        } else {
            console.log('Please install Metamask');
        }
    }

    const verifyWallet = async (wallet) => {
        if (wallet !== "") {
            sessionStorage.setItem('user-wallet', wallet);
            console.log("WalletAddress: " + wallet);

            try {
                const {data} = await http.post("/auth/wallet", {
                    walletAddress: wallet,
                })
                .then(
                    setShowPassword(false),
                    setWalletButton("Wallet Connected"),
                );
                localStorage.setItem("token", data);
                window.location = "/";
            } catch (error) {
                console.log(error);
                if (error.response && error.response.status === 400) {
                    setErrMsgP(error.response.data);
                    setShowPassword(true);
                    setWalletButton("Connect Wallet");
                }
            }

        } else {
            console.log("Wallet not found");
        }
    }
    
    const networkChanged = (chainId) => {
        if (chainId !== "0x13881") {
            handleShow();
            setWalletButton("Connect Wallet");
        } else {
            handleClose();
            setWalletButton("Wallet Connected");
        }
    };
    
    useEffect(() => {

        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.on("chainChanged", networkChanged);
        } else {
            alert('Metamask not found, please install it to be able to login through wallet');
        }
        
        return () => {
            window.ethereum.removeListener("chainChanged", networkChanged);
        };
    });

/* Web3 */

    return (
        <div className="login">
            <form className='frmLogin'>
                
                <h1 className='head-title'>Login</h1>
                <div className="row mb-3 mt-3">
                    <button className="btn btn-danger" onClick={connectWallet}>{walletButton}</button>
                    {showError && <p className='spanErrors'>{errMsg}</p>}
                </div>
                <h2>OR</h2>
                <div className="row mb-3">
                    <label htmlFor='Email'>Email</label>
                    <input
                        className='form-control'
                        placeholder="12345678@dhvsu.edu.ph"
                        type='email'
                        name='email'
                        onChange={(e) => {setEmail(e.target.value)}}
                        value={email}
                        onBlur={emailValidation}
                    />
                    {showEmail && <p className='spanErrors'>{errMsgE}</p>}
                </div>
                <div className="row mb-3">
                    <label htmlFor='Password'>Password</label>
                    <input 
                        className='form-control'
                        placeholder="Password"
                        type='password' 
                        name='password'
                        onChange={(e) => {setPassword(e.target.value)}}
                        value={password}
                        onBlur={passwordValidation}
                    />
                    {showPassword && <p className='spanErrors'>{errMsgP}</p>}
                </div>
                {error && (
                    <div className='error_container'>
                        <span className='form_error'>{error}</span>
                    </div>
                )}
                <div className="row mb-3">
                    <button onClick={checkExpiry} disabled={disableSubmit} className="btn btn-danger btnSubmit" type='submit'>Login</button>
                    <Link to="/register" className="reglogLink">Not yet registered? Register here.</Link>
                </div>
            </form>

            {/* Modal for changing network */}
            <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="false">
                <div className="modal-dialog">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="staticBackdropLabel">Incorrect Network</h1>
                    </div>
                    <div className="modal-body">
                        <p>Please switch to Mumbai Testnet</p>
                    </div>
                    <div className="modal-footer">
                        <button onClick={() => handleNetworkSwitch("mumbai")} type="button" className="btn btn-primary" data-bs-dismiss="modal">Switch Network</button>
                    </div>
                    </div>
                </div>
            </div>

            {/* Modal for Wallet Not Found */}
            <div className="modal" id="walletNotFound" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Wallet Not Registered</h5>
                        <button onClick={handleCloseWallet} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <p>This wallet is not registered in the system.</p>
                    </div>
                    <div className="modal-footer">
                        <button onClick={handleCloseWallet} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button onClick={() => { navigate("/register") }} type="button" className="btn btn-primary">Go to Registration</button>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

