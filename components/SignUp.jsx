"use client";
import React, {useState} from 'react'
import { auth } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from 'firebase/auth'

const SignIn = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const signIn = async () => {

    try {
      await createUserWithEmailAndPassword(auth, email, password)
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