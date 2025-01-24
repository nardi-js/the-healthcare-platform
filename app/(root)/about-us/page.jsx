"use client";

import Image from "next/image";
import AbdulkareemImage from "@/public/Abdulkareem.jpg";
import Huthayfa from "@/public/Huthayfa.jpg";
import Safiullah from "@/public/Safiullah.jpg";
import kamal from "@/public/kamal.jpg";
import nardi from "@/public/nardi.jpg";

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Nardi",
      role: "Team Lead & Full-Stack Developer",
      email: "nardi@healthcare-platform.com",
      image: nardi,
    },
    {
      name: "Huthayfa Derham",
      role: "UI/UX Designer",
      email: "Huthayfa@healthcare-platform.com",
      image: Huthayfa,
    },
    {
      name: "Abdul Rahman Bin Mohd Kamal",
      role: "Full-Stack Developer",
      email: "kamal@healthcare-platform.com",
      image: kamal,
    },
    {
      name: "Safiullah Yousufzai",
      role: "Process Designer",
      email: "safiullah@healthcare-platform.com",
      image: Safiullah,
    },
    {
      name: "ABDULKAREEM SALEM BA WAZIR",
      role: "Project Planner",
      email: "abdulkareem@healthcare-platform.com",
      image: AbdulkareemImage,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Revolutionizing Healthcare Access
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
          The Healthcare Platform is where innovation meets compassion. We're
          transforming the way healthcare information is shared and accessed,
          creating a bridge between healthcare professionals and those seeking
          reliable medical guidance.
        </p>
      </div>

      {/* Mission Statement */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Our Mission
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <p className="text-xl text-gray-600 dark:text-gray-300 text-center leading-relaxed">
            To democratize healthcare knowledge by creating a trusted platform
            where expertise meets accessibility. We believe that quality
            healthcare information should be available to everyone, regardless
            of their location or circumstances.
          </p>
        </div>
      </div>

      {/* Our Vision */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Our Vision
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
            <div className="text-purple-600 dark:text-purple-400 text-4xl mb-4">
              🌍
            </div>
            <h3 className="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Global Access
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Breaking down geographical barriers to make quality healthcare
              information available worldwide, 24/7.
            </p>
          </div>
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
            <div className="text-purple-600 dark:text-purple-400 text-4xl mb-4">
              👥
            </div>
            <h3 className="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Community-Driven
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Fostering a supportive ecosystem where healthcare professionals
              and patients collaborate for better health outcomes.
            </p>
          </div>
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
            <div className="text-purple-600 dark:text-purple-400 text-4xl mb-4">
              💡
            </div>
            <h3 className="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Innovation
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Continuously evolving our platform with cutting-edge technology to
              enhance healthcare communication and education.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16">
        <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Meet Our Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105"
            >
              <div className="relative h-64 w-full">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">
                  {member.role}
                </p>
                <a
                  href={`mailto:${member.email}`}
                  className="inline-block text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {member.email}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default AboutUs;
