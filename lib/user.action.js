import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

const getQuestionCollection = collection(db, "questions");

export const getQuestionList = async () => {
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

export const deleteQuestion = async (id) => {
  try {
    const questionDoc = doc(db, "questions", id);
    await deleteDoc(questionDoc);
    getQuestionList();
  } catch (error) {
    console.log(error);
  }
};

export const updateQuestionF = async (id) => {
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

export const onSubmitQuestion = async () => {
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
