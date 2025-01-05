"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

const Page = () => {
  const [questionBox, setQuestionBox] = useState([]);
  const [newQuestionName, setNewQuestionName] = useState("");
  const [newQuestionDate, setNewQuestionDate] = useState(Number);
  const [newQuestion, setNewQuestion] = useState("");
  const [updateQuestion, setUdateQuestion] = useState("");

  const getQuestionCollection = collection(db, "questions");

  const router = useRouter();

  const getQuestionList = async () => {
    try {
      const data = await getDocs(getQuestionCollection);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setQuestionBox(filteredData);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteQuestion = async (id) => {
    try {
      const questionDoc = doc(db, "questions", id);
      await deleteDoc(questionDoc);
      getQuestionList();
    } catch (error) {
      console.log(error);
    }
  };

  const updateQuestionF = async (id) => {
    try {
      const questionDoc = doc(db, "questions", id);
      await updateDoc(questionDoc, {
        question: updateQuestion,
      });
      getQuestionList();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getQuestionList();
    router.push("/home");
  }, []);

  const onSubmitQuestion = async () => {
    try {
      await addDoc(getQuestionCollection, {
        name: newQuestionName,
        date: newQuestionDate,
        question: newQuestion,
      });
      getQuestionList();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex items-center  pt-20 h-screen flex-col">
      <h1>Page</h1>

      <div>
        <input
          type="text"
          placeholder="name"
          onChange={(e) => setNewQuestionName(e.target.value)}
          className="border-4 border-slate-400"
        />
        <input
          type="text"
          placeholder="date"
          onChange={(e) => setNewQuestionDate(Number(e.target.value))}
          className="border-4 border-slate-400"
        />
        <input
          type="text"
          placeholder="question"
          onChange={(e) => setNewQuestion(e.target.value)}
          className="border-4 border-slate-400"
        />
        <button onClick={onSubmitQuestion} className="bg-slate-400">
          Submit
        </button>
      </div>

      <div>
        {questionBox.map(({ id, date, name, question }) => (
          <div key={id}>
            <h1 className="text-2xl font-extrabold mt-20">{name}</h1>
            <h2>{date}</h2>
            <p>{question}</p>
            <button onClick={() => deleteQuestion(id)} className="bg-slate-400">
              Delete
            </button>
            <input
              placeholder="New Question.."
              onChange={(e) => setUdateQuestion(e.target.value)}
            />
            <button
              className="bg-slate-400"
              onClick={() => updateQuestionF(id)}
            >
              Update Question
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
