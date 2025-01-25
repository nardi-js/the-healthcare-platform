"use client";

import React from "react";
import Link from "next/link";
import ItemCard from "@/components/shared/ItemCard";

const QuestionCard = ({ question, variant = "default" }) => {
  return (
    <Link href={`/questions/${question.id}`} className="block">
      <ItemCard
        item={question}
        type="question"
        onClick={() => {}}
      />
    </Link>
  );
};

export default QuestionCard;