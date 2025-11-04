import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig.js";

// -------------------------------------------------------------
// Function to populate user info in the profile form
// Fetches user data from Firestore and fills in the form fields
// Assumes user is already authenticated
// and their UID corresponds to a document in the "users" collection
// of Firestore.
// Fields populated: name, school, city
// Form field IDs: nameInput, schoolInput, cityInput
// -------------------------------------------------------------
function populateUserInfo() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // reference to the user document
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          const { name = "", school = "", city = "" } = userData;

          document.getElementById("nameInput").value = name;
          document.getElementById("schoolInput").value = school;
          document.getElementById("cityInput").value = city;
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error getting user document:", error);
      }
    } else {
      console.log("No user is signed in");
    }
  });
}

//-------------------------------------------------------------
// Function to enable editing of user info form fields
//-------------------------------------------------------------
document.querySelector("#editButton").addEventListener("click", editUserInfo);
function editUserInfo() {
  //Enable the form fields
  document.getElementById("personalInfoFields").disabled = false;
}

//-------------------------------------------------------------
// Function to save updated user info from the profile form
//-------------------------------------------------------------
document.querySelector("#saveButton").addEventListener("click", saveUserInfo);
async function saveUserInfo() {
  //enter code here
  //a) get user entered values
  const userName = document.getElementById("nameInput").value; //get the value of the field with id="nameInput"
  const userSchool = document.getElementById("schoolInput").value; //get the value of the field with id="schoolInput"
  const userCity = document.getElementById("cityInput").value; //get the value of the field with id="cityInput"
  //b) update user's document in Firestore
  // assuming you already have the logged-in user
  // auth is a pointer to the authentication service (initialized in firebaseConfig.js)

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await updateUserDocument(user.uid, userName, userSchool, userCity); //Helper function;  see code below.
    } else {
      console.log("No user is signed in");
    }
  });
  console.log("Document successfully updated!");
  //c) disable edit
  document.getElementById("personalInfoFields").disabled = true;
}
//call the function to run it
populateUserInfo();

//-------------------------------------------------------------
// 🧩 This is your reusable update function
// Updates the user document in Firestore with new values
// Parameters:
//   uid (string)        - user's UID
//   name (string)       - new name value
//   school (string)     - new school value
//   city (string)       - new city value
// -------------------------------------------------------------
async function updateUserDocument(uid, name, school, city) {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      name: name,
      school: school,
      city: city,
    });
    console.log("User document successfully updated!");
  } catch (error) {
    console.error("Error updating user document:", error);
  }
}
