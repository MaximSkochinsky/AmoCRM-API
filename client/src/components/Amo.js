import React, { useEffect } from 'react'
import { useState } from 'react';
import '../css/amo.css'
import '../css/spinner.css'
import Helmet from 'react-helmet'
import {useNavigate} from 'react-router-dom'

export default function Amo() {


  let navigate = useNavigate()
  const [amoData, setAmoData] = useState({})

  useEffect(() => {
    const form = document.querySelector('form')
    console.log(form)
    form.onsubmit = async (e) => {
      if (e.submitter.name == 'import') {
        e.preventDefault()
        console.log(e.submitter.name)
        const url = document.forms[0].elements[0].value;
        const data = await fetch(`/amo/leads?url=${url}`).then(data => data.json())
        console.log(data)
        
        document.forms[0].elements[2].value = data.type
        document.forms[0].elements[3].value = data.client
        document.forms[0].elements[4].value = data.adress
  
        await setAmoData(data)
      } 
      else if (e.submitter.name == 'submit') {
          e.preventDefault()
          console.log('Подтвердить')
          console.log(amoData)
          navigate('/calendar', {state: amoData})
      }
     
    } 
  })


  return (
      <div className="form-style-6">
        <h1>Contact Us</h1>
        <form>
            <div>
                <input type="text"placeholder="Ссылка на сделку" />
                <input type="submit" name="import" value="Импорт" />
            </div>
            <input type="text" name="field2" placeholder="Предмет сделки" />
            <input type="text" name="field2" placeholder="Клиент" />
            <input type="text" name="field2" placeholder="Адрес клиента" />
            <div>
                <input type="submit" name="submit" value="Подтвердить" />
            </div>
        </form>
      </div>
  )
}