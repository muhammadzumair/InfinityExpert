
const functions = require('firebase-functions')
const { dialogflow, BasicCard, Button, Image, Suggestions, Table, BrowseCarousel, BrowseCarouselItem, Carousel, LinkOutSuggestion } = require('actions-on-google')
const admin = require('firebase-admin')

//creating db connection
admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

const app = dialogflow()

app.intent('Default Welcome Intent', conv => {
    conv.ask(`Hi, I am an Infinity Expert, I'm happy to answer questions about the QX50. For example, ask me about its engine, cargo capacity, design, or the ProPILOT Assist feature`);
    conv.ask(new Carousel({
        items: {
            // Add the first item to the carousel
            'Engine': {
                synonyms: [
                    'Engine',
                    'Engine',
                ],
                title: 'Engine',
                description: `WORLD'S FIRST PRODUCTION READY Variable Compression Turbo Engine`,
                image: new Image({
                    url: 'https://media-cf.assets-cdk.com//public/social/blogs/e7283558a77e10058a6b0050568b6442/92825f70946540828109d73fa0038aae/2019-qx50-variable-compression-engine.png',
                    alt: 'Image alternate text',
                }),
            },
            // Add the second item to the carousel
            'Models': {
                synonyms: [
                    'Models',
                    'Varients'
                ],
                title: 'Models',
                description: 'Infinity QX50 available in 3 different Models of your choice.',
                image: new Image({
                    url: 'http://origin.nissannews.com/en-US/infiniti/usa/photos/1e5b/c9ef/1e5bc9ef-7451-4f4d-893d-1e8132d51519-768x432.jpg',
                    alt: 'QX50 Models',
                }),
            },

            'Cargo Capacity': {
                synonyms: [
                    'Cargo',
                    'Capacity',
                ],
                title: 'Cargo Capacity',
                description: 'QX50 offers an impressive 65.1 cubic feet of cargo space - enough for a weekend getaway for the whole family.',
                image: new Image({
                    url: 'https://www.infinitiusa.com/crossover/qx50/assets/images/medium/2019-qx50-luxury-crossover-cargo-space.jpg',
                    alt: 'Cargo',
                }),
            },
        },
    }));
})


app.intent('Get Option', (conv, input, option) => {
    if (option === 'Engine') {
        conv.followup('Invoke_Engine_Intent');
    }
    else if (option === 'Cargo Capacity') {
        conv.ask('Tap the chip below for more information about cargo capacity')
        conv.ask(new LinkOutSuggestion({
            name: 'Tap for more details',
            url: 'https://www.infinitiusa.com/crossover/qx50/',
          }));
    }
    else if (option === 'Models') {
        conv.followup('Invoke_Models_Intent');
    }
    else {
        conv.close('No item Found')
    }
})


app.intent('Models', conv => {
    conv.ask('Infinity QX50 available in 3 different Models of your choice.');
    conv.ask(new BrowseCarousel({
        items: [
            new BrowseCarouselItem({
                title: 'QX50 PURE',
                url: 'https://www.infiniti.ca/en/crossover/qx50/models-specs',
                description: 'Starting at  \n$36,550',
                image: new Image({
                    url: 'https://www.infinitimarin.com/inventoryphotos/5062/3pcaj5m31kf115553/ip/1.jpg',
                    alt: 'PURE',
                })
            }),
            new BrowseCarouselItem({
                title: 'QX50 LUXE',
                url: 'https://www.infiniti.ca/en/crossover/qx50/models-specs',
                description: 'Starting at  \n$39,400',
                image: new Image({
                    url: 'https://c4d709dd302a2586107d-f8305d22c3db1fdd6f8607b49e47a10c.ssl.cf1.rackcdn.com/thumbnails/stock-images/08b4adc49ec7e5a1f3484a0aa1eff3af.png',
                    alt: 'LUXE',
                })
            }),
            new BrowseCarouselItem({
                title: 'QX50 ESSENTIAL',
                url: 'https://www.infiniti.ca/en/crossover/qx50/models-specs',
                description: 'Starting at  \n$43,350',
                image: new Image({
                    url: 'https://www.crossroadsfordsouthboston.com/assets/stock/ColorMatched_01/White/640/cc_2019INS140001_01_640/cc_2019INS140001_01_640_K23.jpg',
                    alt: 'Essential',
                }),
            }),
        ],
    }));
    conv.ask(new Suggestions(['Models', 'Engine', 'Cargo Capacity', 'Design', 'ProPILOT feature']));
})

app.intent('Engine', conv => {
    conv.ask(`It has a 2 liter VC-Turbo 4-cylinder engine with 268 horsepower & 280 foot pounds of torque`);
    conv.ask(new Table({
        title: `WORLD'S FIRST PRODUCTION READY`,
        subtitle: 'Variable Compression Turbo Engine',
        image: new Image({
            url: 'https://media-cf.assets-cdk.com//public/social/blogs/e7283558a77e10058a6b0050568b6442/92825f70946540828109d73fa0038aae/2019-qx50-variable-compression-engine.png',
            alt: 'QX50'
        }),
        dividers: true,
        columns: ['FEATURES', 'POWER', 'EFFICIENCY'],
        rows: [
            ['Compression Ration', '8:1', '14:1']
        ]
    })
    )
    conv.ask(new Suggestions(['Models', 'Engine', 'Cargo Capacity', 'Design', 'ProPILOT feature']));
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