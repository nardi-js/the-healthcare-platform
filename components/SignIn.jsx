
import React, {useState} from 'react'
import { auth } from '../config/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

const SignIn = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const signIn = async () => {

    try {
      const user = await signInWithEmailAndPassword(auth, email, password)
      console.log(user)
    }
    catch (error) {
      console.log(error)
    }

  }

  return (
    <div>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={signIn}>Sign In</button>
    </div>
  )
}

export default SignIn