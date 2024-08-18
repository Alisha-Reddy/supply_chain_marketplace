import React, { Children, useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

// INTERNAL IMPORTS
import tracking from "../Context/Tracking.json"
const ContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
const ContractABI = tracking.abi;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// FETCHING SMART CONTRACT
const fetchContract = (signerOrProvider) =>
    new ethers.Contract(ContractAddress, ContractABI, signerOrProvider);

export const TrackingContext = React.createContext();

export const TrackingProvider = ({ children }) => {
    
    // STATE VARIABLE
    const DappName = "Product Tracking Dapp";
    const [currentUser, setCurrentUser] = useState("");

    const createShipment = async (items) => {
        console.log(items);
        const { receiver, pickupTime, distance, price } = items;

        try {
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);
            const createItem = await contract.createShipment(
                receiver, 
                new Date(pickupTime).getTime(),
                distance,
                ethers.utils.parseUnits(price, 18),
                {
                    value: ethers.utils.parseUnits(price,18),
                }
            )
            await createItem.wait();
            console.log(createItem);
        } catch (error) {
            console.log("Something went wrong!", error);
        }
    }

    const getAllShipment = async () => {
        try {
            // const provider = new ethers.providers.JsonRpcProvider()
            // console.log(provider)
            // const contract = fetchContract(provider);
            console.log("1")
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(ContractAddress,ContractABI, signer)
            
            console.log("2")
            await delay(2000)
            const shipments = await contract.getAllTransactions()
            
            // const shipments = [
            //     {
            //         sender: "0xSenderAddress",
            //         receiver: "0xReceiverAddress",
            //         price: ethers.utils.parseEther("0.5"),
            //         pickupTime: ethers.BigNumber.from(Math.floor(Date.now() / 1000)), // Convert to integer
            //         deliveryTime: ethers.BigNumber.from(Math.floor((Date.now() + 3600) / 1000)), // Convert to integer
            //         distance: ethers.BigNumber.from(100),
            //         isPaid: true,
            //         status: "Delivered",
            //     },
            // ]
            await delay(2000)
            console.log("3")
            const allShipments = shipments.map((shipment) => ({
                sender: shipment.sender,
                receiver: shipment.receiver,
                price: ethers.utils.formatEther(shipment.price.toString()),
                pickupTime: shipment.pickupTime.toNumber(),
                deliveryTime: shipment.deliveryTime.toNumber(),
                distance: shipment.distance.toNumber(),
                isPaid: shipment.isPaid,
                status: shipment.status,
            }));

            return allShipments;
        } catch (error) {
            console.log("Something went wrong", error);
        }
    }

    const getShipmentsCount = async () => {
        try {
            if (!window.ethereum) return "Install MetaMask";
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            // const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/ErVq1VJ9pedwYuXG8L_WGfru6tpp-VxV`);
            // const contract = fetchContract(provider);

            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(ContractAddress, ContractABI, signer)
            const shipmentsCount = await contract.getShipmentsCount(accounts[0]);
            return shipmentsCount.toNumber();
        } catch (error) {
            console.log("error:",
                error);
        }
    }

    const completeShipment = async (completeShip) => {
        console.log(completeShip);

        const { receiver, index } = completeShip;
        try {
            if (!window.ethereum) return "Install Metamask";

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            })
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);

            const transaction = await contract.completeShipment(
                accounts[0],
                receiver,
                index,
                {gasLimit: 300000,}
            )

            transaction.wait();
            console.log(transaction);
        } catch (error) {
            console.log("wrong completeshipent", error);
        }
    }

    const getShipment = async (index) => {
        console.log(index * 1);
        try {
            if (!window.ethereum) return "Install Metamask";

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            })
            // const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/ErVq1VJ9pedwYuXG8L_WGfru6tpp-VxV`);
            // const contract = fetchContract(provider);

            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(ContractAddress, ContractABI, signer)
            const shipment = await contract.getShipment(accounts[0], index * 1);

            const SingleShipment = {
                sender: shipment[0],
                receiver: shipment[1],
                pickupTime: shipment[2].toNumber(),
                deliveryTime: shipment[3].toNumber(),
                distance: shipment[4].toNumber(),
                price: ethers.utils.formatEther(shipment[5].toString()),
                status: shipment[6],
                isPaid: shipment[7],
            }

            return SingleShipment;
        } catch (error) {
            console.log("Sorry no shipment", error);
        }
    }

    const startShipment = async (getProduct) => {
        const { receiver, index } = getProduct;

        try {
            if (!window.ethereum) return "Install Metamask";

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);
            const shipment = await contract.startShipment(
                accounts[0],
                receiver,
                index * 1
            )

            shipment.wait();
            console.log(shipment);

        } catch (error) {
            console.log("Sorry no shipment", error);
        }
    }

    // CHECK WALLET CONNECTED
    const checkIfWalletConnected = async () => {
        try {
            if (!window.ethereum) return "Tnstall Metamask";

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            })

            if (accounts.length) {
                setCurrentUser(accounts[0]);
            } else {
                return "No account";
            }
        } catch (error) {
            return "not connected";
        }
    }

    // CONNECT THE WALLET
    const connectWallet = async () => {
        try {
            if (!window.ethereum) return "Install Metamask";

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            })
            setCurrentUser(accounts[0]);
        } catch (error) {
            return "Something went wrong";
        }
    }

    useEffect(() => {
        checkIfWalletConnected();
    }, []);

    return (
        <TrackingContext.Provider
            value={{
                connectWallet,
                createShipment,
                getAllShipment,
                completeShipment,
                getShipment,
                startShipment,
                getShipmentsCount,
                DappName,
                currentUser,
            }}
        >
            {children}
        </TrackingContext.Provider>
    );
}

