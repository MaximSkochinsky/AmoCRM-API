import React, { useEffect } from 'react'
import { useState } from 'react';
import '../css/style.css'
import '../css/spinner.css'
import Helmet from 'react-helmet'
import {useLocation, useNavigate} from 'react-router-dom'
import useScript from '../hooks/UseScript';

export default function Calendar() {

  let {state} = useLocation()  
  let navigate = useNavigate()

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
    let daysDiv = document.querySelector('.spinner')
    let spinnerDiv = document.createElement('div')
    spinnerDiv.classList.add('loader')
    spinnerDiv.id = 'loader'
    spinnerDiv.style.marginTop = '300px'
    daysDiv.appendChild(spinnerDiv)
  }
  
  
  const removeSpinner = () => {
    let spinnerDiv = document.getElementById('loader')
    if (spinnerDiv) spinnerDiv.remove()
  }


  useEffect(() => {

    async function loadCalendar() {

        console.log(state)

        let date = new Date();

        let activatedDate = null 
        let freeDates = [] 

        const getFreeSlotsDates = async (year, month) => {
            let slots = await fetch(`/api/slot/${year}/${month}`).then(response => {
                if (response) {
                return response.json()
                }
                else {
                return null
                }
            })
            if (slots) {
                for (let slot of slots) {
                let slotDate = new Date(slot.start.dateTime)
                }
            }  
            return slots
        }
    
        const renderCalendar = () => {
            date.setDate(1);
        
            const monthDays = document.querySelector(".days");
        
            const lastDay = new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            0
            ).getDate();
        
            const prevLastDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            0
            ).getDate();
        
            const firstDayIndex = date.getDay();
        
            const lastDayIndex = new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            0
            ).getDay();
        
            const nextDays = 7 - lastDayIndex - 1;
        
            const months = [
            "Январь",
            "Февраль",
            "Март",
            "Апрель",
            "Май",
            "Июнь",
            "Июль",
            "Август",
            "Сентябрь",
            "Октябрь",
            "Ноябрь",
            "Декабрь",
            ];
        
            document.querySelector(".date h1").innerHTML = months[date.getMonth()] + `, ${date.getFullYear()}`;
        
            document.querySelector(".date p").innerHTML = new Date().toLocaleString("ru", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
            });
        
            let days = "";
        
            for (let x = firstDayIndex; x > 0; x--) {
            days += `<div class="prev-date">${prevLastDay - x + 1}</div>`;
            }
        
            for (let i = 1; i <= lastDay; i++) {
            if (
                i === new Date().getDate() &&
                date.getMonth() === new Date().getMonth()
            ) {
                days += `<div class="today">${i}</div>`;
            } else {
                days += `<div>${i}</div>`;
            }
            }
        
            for (let j = 1; j <= nextDays; j++) {
            days += `<div class="next-date">${j}</div>`;
            monthDays.innerHTML = days;
            }
        };
        
        const clearDays = () => {
            let daysDiv = document.querySelector('.days')
            while (daysDiv.firstChild) {
            daysDiv.removeChild(daysDiv.lastChild);
            }
        }



        if (window.location.pathname === '/calendar') {
            addSpinner()
            const slots = await getFreeSlotsDates(date.getFullYear(), date.getMonth() + 1) // вынести в отлдельный метод!!!!!!!
            removeSpinner()
            renderCalendar()
            setFreeSlots(slots)
        }


        window.onhashchange = async function() {
            addSpinner()
            const slots = await getFreeSlotsDates(date.getFullYear(), date.getMonth() + 1)
            removeSpinner()
            renderCalendar()
            setFreeSlots(slots)
         }
        

        document.querySelector(".prev").addEventListener("click", async () => {
            if (window.location.pathname === '/calendar') {
            date.setMonth(date.getMonth() - 1);
            clearDays()
            addSpinner()
            await getFreeSlotsDates(date.getFullYear(), date.getMonth() + 1).then((slots) => {
                renderCalendar()
                setFreeSlots(slots)
            })
            removeSpinner()
            }
            
        });
        
        document.querySelector(".next").addEventListener("click", async () => {
            if (window.location.pathname === '/calendar') {
            date.setMonth(date.getMonth() + 1);
            clearDays()
            addSpinner()
            await getFreeSlotsDates(date.getFullYear(), date.getMonth() + 1).then((slots) => {
                renderCalendar()
                setFreeSlots(slots)
            })
            removeSpinner()
            }
        });
        
        
        document.querySelector(".days").addEventListener("click", (e) => {
            if (e.target.className !== 'days') {
                if (activatedDate) {
                    if (activatedDate.className !== 'free') activatedDate.style.backgroundColor = '#f50808'
                    else activatedDate.style.backgroundColor = "#CC9795"
                }
                activatedDate = e.target
                e.target.style.backgroundColor = '#581845'
                if (activatedDate.className !== 'today') document.querySelector('.today').style.backgroundColor = 'white'
            }
        });
        
        
        document.querySelector(".days").addEventListener("dblclick", (e) => {
            if (e.target.className !== 'days') {
                navigate(`/slots?year=${date.getFullYear().toString()}&month=${(date.getMonth() + 1).toString()}&day=${(e.target.innerHTML).toString()}`, {state: state})
            }
        });



        function removeFromArr(arr, value) {
            return arr.filter((ele) => {
                return ele != value
            })
        }
        
        
        function setFreeSlots(slots) {
            let datesWithFreeSlots = []
            for (let slot of slots) {
                let startTime = new Date(slot.start.dateTime)
                let endTime = new Date(slot.end.dateTime)
                if (slot.summary === "Свободно") {
                    if (!datesWithFreeSlots.includes(startTime.getDate())) {
                    datesWithFreeSlots.push(startTime.getDate())
                    }
                }
            }
        
        
            let ch = document.querySelector('.days').childNodes
        
            for (let child of ch) {
                if (child.className === 'today' || !child.className) {
                    if (datesWithFreeSlots.includes(parseInt(child.innerHTML))) {
                        removeFromArr(datesWithFreeSlots, parseInt(child.innerHTML))
                        if (child.className !== 'today') child.classList.add('free')
                    }
                }
            }
        }
    }

    loadCalendar()


})


  return (
    <div className="container">
        <div className="calendar">
            <div className="month">
                <i className="fas fa-angle-left prev"></i>
                <div className="date">
                <h1></h1>
                <p></p>
                </div>
                <i className="fas fa-angle-right next"></i>
            </div>
            <div className="weekdays">
                <div>ВС</div>
                <div>ПН</div>
                <div>ВТ</div>
                <div>СР</div>
                <div>ЧТ</div>
                <div>ПТ</div>
                <div>СБ</div>
            </div>
            <div className="spinner">
            </div>
            <div className="days">
            </div>
        </div>
    </div>
  )
}