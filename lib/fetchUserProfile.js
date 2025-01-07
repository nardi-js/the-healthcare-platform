import { auth, db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { redirect } from "next/navigation";

async function fetchUserProfile() {
  const user = auth.currentUser;

  if (!user) {
    console.log("No user is signed in");
  }

  try {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      console.log("User data:", userData);
      return userData; // { name, photoURL, email, etc. }
    } else {
      console.log("No user profile found in Firestore");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
}

export default fetchUserProfile;
