import React, { useEffect } from 'react'
import { useState } from 'react';
import '../css/slots.css'
import '../css/spinner.css'
import {useLocation, useNavigate} from 'react-router-dom'

export default function Slots() {

  let {state} = useLocation()
  let navigate = useNavigate()
  const [amoData, setAmoData] = useState({})


    useEffect(() => {
        console.log(state)
        async function loadSlots () {
       
            const getParams = () => {
                let params = (new URL(window.location)).searchParams;
                let data = {
                    year: params.get("year"),
                    month: params.get("month"),
                    day: params.get("day")
                }
                return data
            }
            
            
            
            const clearSlots = () => {
              let slotsDiv = document.querySelector('.slots')
              while (slotsDiv.firstChild) {
                slotsDiv.removeChild(slotsDiv.lastChild);
              }
            }
            
            
            
            const getSlots = async (date) => {
                let startTimes = []
                const slots = await fetch(`/api/slot/${date.year}/${date.month}/${date.day}`).then(data => data.json())
                for (let slot of slots) {
            
                    if (!startTimes.includes(new Date(slot.start.dateTime).getTime())) startTimes.push(new Date(slot.start.dateTime).getTime())
                    else continue
                    let slotsDiv = document.querySelector('.slots')
                    let slotButton = document.createElement('button')
                    slotButton.className = 'button-78'
                    slotButton.role = 'button'
                    slotButton.onclick = async (e) => {
                        // let organizers = []
                        console.log(e)
                        let time = e.target.innerHTML.split(':')
                        const params = getParams()
                        clearSlots()
                        addSpinner()
                        const slots = await fetch(`/api/slot/${params.year}/${params.month}/${params.day}/${parseInt(time[0])}/${parseInt(time[1])}/`).then(data => data.json())
                        console.log(`/api/slot/${params.year}/${params.month}/${params.day}/${parseInt(time[0])}/${parseInt(time[1])}/`)
                        removeSpinner()
                        for (let slot of slots) {
                            let slotsDiv = document.querySelector('.slots')
                            let slotButton = document.createElement('button')
                            slotButton.classList.add('button-71') 
                            slotButton.classList.add('button-78')
                            slotButton.role = 'button'  
                            console.log(slot)  
                            slotButton.innerHTML = `${(new Date(slot.start.dateTime)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}<br></br>${slot.organizer.email}`      
                            slotButton.id = slot.id
                            slotButton.onclick = async (e) => {
                                let params = getParams()
                                let organizer = e.target.innerHTML.substring(e.target.innerHTML.lastIndexOf('>') + 1, e.target.innerHTML.length)
                                let time = e.target.innerHTML.substring(0, e.target.innerHTML.indexOf('<')).split(':')
                                let url =  `/api/slot/${params.year}/${params.month}/${params.day}/${parseInt(time[0])}/${parseInt(time[1])}/`
                                state["event_id"] = e.target.id
                                state["calendar_id"] = organizer
                                let stateJSON = JSON.stringify(state)
                                const result = await fetch(url, {
                                    method: 'POST', 
                                    headers: {
                                        'Content-Type': 'application/json'
                                        // 'Content-Type': 'application/x-www-form-urlencoded',
                                    },
                                    body: stateJSON
                                })
                            }
                            
                            slotsDiv.appendChild(slotButton)
                        }
            
                    }
                    slotButton.innerHTML = `${(new Date(slot.start.dateTime)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                    slotsDiv.appendChild(slotButton)
                }
                console.log(startTimes)
                return slots
            }
            
            
            
            const checkIfSpinnerExists = () => {
                let daysDivChildNodes = document.querySelector('.spinner').childNodes
                for (let node of daysDivChildNodes) {
                  console.log(node.className)
                  if (node.className === 'loader') return true
                }
                return false
              }
              
              
              const addSpinner = () => {
                if (checkIfSpinnerExists()) return
                console.log('spinnner')
                let daysDiv = document.querySelector('.spinner')
                console.log(daysDiv)
                let spinnerDiv = document.createElement('div')
                spinnerDiv.classList.add('loader')
                spinnerDiv.id = 'load'
                daysDiv.appendChild(spinnerDiv)
              }
              
              
              const removeSpinner = () => {
                let spinnerDiv = document.getElementById('load')
                if (spinnerDiv) spinnerDiv.remove()
              }
              
            
        
            addSpinner()
            let params = getParams()
            let date = new Date(parseInt(params.year), parseInt(params.month - 1), parseInt(params.day)).toLocaleString("ru", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
                });
            document.querySelector('.slots_date h1').innerHTML = date
            const slots = await getSlots(params)
            removeSpinner()
            
        }

        loadSlots()
       
    }, [])


  return (
    <div className="container">
        <div className="slots_menu">
        <div className="slots_month">
            <div className="slots_date">
            <h1 id="date"></h1>
            </div>
        </div>
        <div className="spinner">

        </div>
        <div className="slots">
            
        </div>
        </div>
    </div>
  )
}