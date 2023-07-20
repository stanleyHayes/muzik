import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import 'firebase/compat/storage'

const firebaseConfig = {
    apiKey: 'AIzaSyB2B1aJ9xQsnP74SRXZ6aajWpa9Tl6_MWk',
    authDomain: 'music-996b6.firebaseapp.com',
    projectId: 'music-996b6',
    storageBucket: 'music-996b6.appspot.com',
    messagingSenderId: '21617843483',
    appId: '1:21617843483:web:99063d7e32db08cff907be'
}

firebase.initializeApp(firebaseConfig)

const auth = firebase.auth()
const db = firebase.firestore()
db.enablePersistence()
    .then(r => console.log('persistence enabled', r))
    .catch(error => console.log(`Firebase persistence error ${error.code}`));
db.enableNetwork().then(r => console.log('persistence enabled', r));
const storage = firebase.storage()

const usersCollection = db.collection('users')
const songsCollection = db.collection('songs')
const commentsCollection = db.collection('comments')

export { auth, db, usersCollection, songsCollection, storage, commentsCollection }
