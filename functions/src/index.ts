

/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const functions = require('firebase-functions')
const { dialogflow } = require('actions-on-google')
const admin = require('firebase-admin')

//creating db connection
admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

const app = dialogflow()

app.intent('Default Welcome Intent', conv => {
    conv.ask('Welcome to my agent!')
})

app.intent('Default Fallback Intent', conv => {
    conv.ask(`I didn't understand`)
    conv.ask(`I'm sorry, can you try again?`)
})

//creating document in db 

const setDoc = db.collection('Chatbot').doc('LN')

app.intent('Languages', (conv, { language, ProgrammingLanguage }) => {
    if (language) {

        //saving data in document db

        const data = {
            Language: language
        };
        setDoc.set(data)

        //setting Context
        conv.contexts.set('said_language', 5, { languageContext: language })
        conv.contexts.set('said_programming_language', 0)
        conv.ask(`Wow! I didn't know you knew ${language}`);

    } else if (ProgrammingLanguage) {

        conv.contexts.set('said_programming_language', 5, { ProgramminglanguageContext: ProgrammingLanguage })
        conv.contexts.set('said_language', 0)
        conv.ask(`${ProgrammingLanguage} is cool.`);

    } else {

        conv.ask(`What language do you know?`)

    }

    //Why doesn't this work?  And worse, it makes recognition of language (e.g. french, english etc) in the sentence fail too.
    //   agent.context.set({           //this does not work, not sure why. Adding it here also seemed to wreck the ability to recognize langage (e.g. french) but not ProgrammingLanguage (e.g. javascript) (which is odd)
    //     'name':'SaidLanguage',
    //     'lifespan': 5,
    //     'parameters':{
    //     'language' : 'french',
    //     'ProgrammingLanguage':'js'
    //     }
    //   });


});

app.intent('Name', (conv, { CarParts }) => {
    let getLangContext = conv.contexts.get('said_language');
    let getProgLangContext = conv.contexts.get('said_programming_language');

    if (getLangContext) {
        console.log("geting context: ", getLangContext.parameters.languageContext)
        conv.ask(`That's wonderful that you like ${CarParts} I really like them too, and you know ${getLangContext.parameters.languageContext}`);
    }
    else if (getProgLangContext) {
        console.log("geting context: ", getProgLangContext.parameters.languageContext)
        conv.ask(`That's wonderful that you like ${CarParts} I really like them too, and you know ${getProgLangContext.parameters.ProgramminglanguageContext}`);
    }
    else {
        conv.ask(`That's wonderful that you like ${CarParts} I really like them too.`);
    }
});

function gettingData() {
    return new Promise((resolve, reject) => {
        setDoc.get()
            .then(obj => {
                resolve(obj.data().Language)
            })
    })
}

app.intent('FirebaseDB', async (conv) => {

    const getLanguage = await gettingData()
    if (getLanguage) {
        conv.ask(`Yes i know you can speak ${getLanguage}`)
        console.log('Document Data:', getLanguage)
    }
    else {
        conv.ask(`Sorry, i have no idea `)
        conv.ask(`What language do you know?`)
    }

});


exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app)