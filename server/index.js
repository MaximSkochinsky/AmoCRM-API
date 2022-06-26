const express = require('express');
const { google } = require('googleapis');
const fs = require('fs')
const pretty = require('express-prettify');
const { Client } = require('amocrm-js');
const cors = require('cors')
const path = require('path')


const app = express()
const {crm, run} = require('./amo')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'client/build')));


// app.use(pretty({ query: 'pretty' }));

let eventsIds = []
let calendarIds = []




const data = JSON.parse(fs.readFileSync('./credentials.json'));
// console.log(data.client_email)

const SCOPES = 'https://www.googleapis.com/auth/calendar';
const GOOGLE_PRIVATE_KEY= data.private_key
const GOOGLE_CLIENT_EMAIL = data.client_email
const GOOGLE_PROJECT_NUMBER = "77635256312"
const GOOGLE_CALENDAR_ID = "5d484663fg2u1akdbqh3pni88o@group.calendar.google.com"

  
const jwtClient = new google.auth.JWT(
    GOOGLE_CLIENT_EMAIL,
    null,
    GOOGLE_PRIVATE_KEY,
    SCOPES
);



  
const calendar = google.calendar({
    version: 'v3',
    project: GOOGLE_PROJECT_NUMBER,
    auth: jwtClient
});
  

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: 'https://www.googleapis.com/auth/calendar', //full access to edit calendar
});

 
// app.get('/createEvent', (req, res) => {
//   const event = {
//     'summary': 'Habr Post Demo',
//     'description': 'Тест для демонстрации интеграции nodejs-приложения с Google Calendar API.',
//     'start': {
//         'dateTime': '2022-06-13T16:00:00+03:00',
//         'timeZone': 'Europe/Moscow',
//     },
//     'end': {
//         'dateTime': '2022-06-13T18:00:00+03:00',
//         'timeZone': 'Europe/Moscow',
//     }
//   };



//   auth.getClient().then(a=>{


//     calendar.events.insert({
//       auth:a,
//       calendarId: GOOGLE_CALENDAR_ID,
//       resource: event,
//     }, function(err, event) {
//       if (err) {
//         console.log('There was an error contacting the Calendar service: ' + err);
//         return;
//       }
//       console.log('Event created: %s', event.data);
//       res.jsonp("Event successfully created!");
//     });
//   })


// })


// app.get('/updateEvent', (req, res) => {

//     auth.getClient().then(a=> {

//       try {
//         calendar.events.update({
//             auth: a,
//             calendarId:GOOGLE_CALENDAR_ID, 
//             eventId: '81bobop5v40buggdejbp00dnb4',
//             resource: {
//                start : {dateTime: new Date(2022, 3, 17, 15, 0, 0), timeZone: 'Europe/Moscow'},
//                end: {dateTime: new Date(2022, 3, 17, 17, 0, 0), timeZone: 'Europe/Moscow'},
//                location: 'Borisov, Belarus'
//             }
//         })
//       } catch (e) {
//           console.log(e.message)
//       } 
//     })

// })



app.post('/api/slot/:year/:month/:day?/:hours?/:min?', (req, res) => {
    console.log(req.body)
    auth.getClient().then(async a=> {

    try {
        let event = calendar.events.get({"calendarId": req.body.calendar_id, "eventId": req.body.event_id})
        event.summary = req.body.type
        event.description = `Клиент: ${req.body.client}  Адрес: ${req.body.adress}`

        let request = await calendar.events.patch({
          'calendarId': req.body.calendar_id,
          'eventId': req.body.event_id,
          'resource': event
        });

        request.execute()
      } catch (e) {
          console.log(e.message)
      } 
      
    })

    
})






app.get('/api/slot/:year/:month/:day?/:hours?/:min?', (req, res) => {
      
      getCalendarIds().then(async calendarIds => {
        console.log('asdasd')
        let id = []

        let dateMin = req.params.day? (req.params.hours? new Date(parseInt(req.params.year), parseInt(req.params.month) - 1, parseInt(req.params.day), parseInt(req.params.hours) - 3, parseInt(req.params.min)).toISOString()
           : new Date(parseInt(req.params.year), parseInt(req.params.month) - 1, parseInt(req.params.day)).toISOString())
           : new Date(parseInt(req.params.year), parseInt(req.params.month) - 1, 1).toISOString()
        
        let dateMax = req.params.day? (req.params.hours? new Date(parseInt(req.params.year), parseInt(req.params.month) - 1, parseInt(req.params.day), parseInt(req.params.hours) - 3, parseInt(req.params.min) + 1).toISOString()
        : new Date(parseInt(req.params.year), parseInt(req.params.month) - 1, parseInt(req.params.day) + 1).toISOString())
        : new Date(parseInt(req.params.year), parseInt(req.params.month), 1).toISOString()

        console.log(dateMin + '   ' + dateMax)



        for (let calendarId of calendarIds) {
           let newId = null 
           
           await new Promise( resolve => {
                calendar.events.list(
                  {
                    calendarId: calendarId,
                    singleEvents: true,
                    orderBy: "startTime",
                    timeMin: dateMin,
                    timeMax: dateMax
                  }, 
                  (error, result) => {
                    if (error) {
                      console.log("Something went wrong: ", error); // If there is an error, log it to the console
                    } else {
                      if (result.data.items.length > 0) {
                        newId = result.data.items
                        return resolve(newId)
                        // console.log(id)
                      } else {
                        console.log("No upcoming events found.");
                        return resolve([]) // If no events are found
                      }
                    }
                  }
                )
                
            }).then(data => {
                id = id.concat(data)
            })

          }
          return id
      }).then(data => {
        res.send(data)
      })

})

app.get('/api/slot/:id?', (req, res) => {

  calendar.events.list(
      {
        calendarId: GOOGLE_CALENDAR_ID,
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
      },
      (error, result) => {
        if (error) {
          console.log("Something went wrong: ", error); // If there is an error, log it to the console
        } else {
          if (result.data.items.length > 0) {
            for (let i in result.data.items) {
              if (req.params.id) {
                if (req.params.id === result.data.items[i].id)  {
                  res.json(result.data.items[i])
                  return
                }
              } 
              eventsIds.push(result.data.items[i].id)
            }
            res.json(eventsIds)
          } else {
            console.log("No upcoming events found."); // If no events are found
          }
        }
      }
  );
  
    

})






app.get('/api/calendar', (req, res) => {

  calendar.calendarList.list(
    {
    },
    (err, result) =>  {
      res.json(result.data.items)
    }
  );

  getCalendarIds()

}) 



app.post('/api/calendar', (req, res) => {
    pushCalendarId(req.body.id)
    console.log('POST request')
})


const getCalendarIds = () => {
  return new Promise(resolve => {
    calendar.calendarList.list(
      {
      },
      (err, result) =>  {
          let calendarIds = []
          result.data.items.forEach(calendar => {
              calendarIds.push(calendar.id)
              console.log(calendar.id)
          })
        resolve(calendarIds)
      }
    )
  })
}



const pushCalendarId = (id) => {
  calendar.calendarList.insert({
    auth: auth,
    requestBody: {
      id: id
    }
  })

  calendarIds.push(id)
}







const createSlot = (date) => {
    
    return getCalendarIds().then(calendarIds => {

      let deltas = [0.5, 1, 1.5, 2, 3]
      let startTime = new Date(date.year, date.month - 1, date.day, date.time - 3, 0, 0)

      let endTime =  new Date(date.year, date.month - 1, date.day, date.time - 3, 0, 0)
      endTime.setTime(endTime.getTime() + deltas[Math.floor(Math.random() * deltas.length)] * 60 * 60 * 1000);
      
      console.log(startTime)
      console.log(endTime)

      endTime = endTime.toISOString()
      startTime = startTime.toISOString()
     

      const event = {
        'summary': 'Свободно',
        'description': 'Свободный слот',
        'start': {
            'dateTime': startTime,
            'timeZone': 'Europe/Moscow',
        },
        'end': {
            'dateTime': endTime,
            'timeZone': 'Europe/Moscow',
        }
      };
    
      console.log(calendarIds)
      new Promise(resolve => {
        calendarIds.forEach(id => {
          // console.log('asdasdajsbdkjasdbaskjdbakjdbkasbdkajsdbjkasbdkabsdjkasbdabsdkasbdjkab')
          auth.getClient().then(async a=>{

              await calendar.events.insert({
                auth:a,
                calendarId: id,
                resource: event,
              }, async function(err, event) {
                if (err) {
                  console.log('There was an error contacting the Calendar service: ' + err);
                }
                await console.log('Event created: %s', event.data);
              });
            }
          )
        })
        resolve('success')
      }).then(() => {console.log('end!!!')})
      
      
    })

    
  
}

// createSlot({
//     year: 2022, 
//     month: 7,
//     day: 14,
//     time: 12
// }).then(() => {
//   console.log('success')
// })


app.listen(5000, () => console.log(`App listening on port 5000!`));
  
// This code is contributed by Yashi Shukla

run()

app.get('/amo/leads', async (req, res) => {
    console.log(req.query.url)
    let urlSplit = req.query.url.split('/')
    if (Number.isInteger(parseInt(urlSplit[urlSplit.length - 1]))) {
      const result = await crm.request.make('GET', `/api/v4/leads/${urlSplit[urlSplit.length - 1]}`);
      let clientUrl = result.data._embedded.companies[0]._links.self.href;
      
      
      const clientData = await crm.request.make('GET', clientUrl);
      console.log(clientData.data.custom_fields_values[0].values[0].value)
      console.log(clientData.data)

      res.send({type: result.data.name, client: clientData.data.name, adress: clientData.data.custom_fields_values[0].values[0].value})
      return
    }
    res.send({})
    
    // console.log(result.data._embedded.leads[0]);
    // const company = await crm.request.make('GET', result.data._embedded.leads[0]._embedded.companies[0]._links.self.href)
    // console.log(company.data)
})