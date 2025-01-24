import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

// List of emails allowed to become admins
const ALLOWED_ADMIN_EMAILS = [
  // Add your email here
  "abdulrahman1stu141@gmail.com"  // Replace with your actual email
];

// Function to set up an admin user
export async function setUpAdminUser(userId, email) {
  // Check if the email is allowed to be an admin
  if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
    console.error('Unauthorized email for admin access');
    return {
      success: false,
      error: 'Unauthorized email for admin access'
    };
  }

  try {
    await setDoc(doc(db, 'users', userId), {
      email: email,
      isAdmin: true,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });
    
    console.log('Admin user set up successfully');
    return {
      success: true
    };
  } catch (error) {
    console.error('Error setting up admin user:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
