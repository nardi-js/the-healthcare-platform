"use client";

import Image from "next/image";

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Lead Healthcare Specialist",
      email: "sarah.johnson@healthcare-platform.com",
      image: "/team/sarah.jpg",
      background: "Dr. Sarah Johnson has over 15 years of experience in healthcare technology. She completed her MD at Stanford University and later pursued a Master's in Health Informatics. Her passion lies in making healthcare more accessible through technology.",
    },
    {
      name: "Michael Chen",
      role: "Technical Lead",
      email: "michael.chen@healthcare-platform.com",
      image: "/team/michael.jpg",
      background: "Michael is a seasoned software engineer with a focus on healthcare systems. He holds a Master's in Computer Science from MIT and has previously worked on several successful healthcare startups.",
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Medical Content Director",
      email: "emily.rodriguez@healthcare-platform.com",
      image: "/team/emily.jpg",
      background: "Dr. Rodriguez brings her expertise in medical education and content creation. She has practiced medicine for 10 years and is passionate about making medical information more accessible to the public.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Platform Description */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          About The Healthcare Platform
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          The Healthcare Platform is a revolutionary space where healthcare professionals
          and patients come together to share knowledge, experiences, and support.
          Our mission is to make quality healthcare information accessible to everyone
          while fostering a community of care and expertise.
        </p>
      </div>

      {/* Our Vision */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Our Vision
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Accessible Healthcare
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Making quality healthcare information available to everyone, anywhere.
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Community-Driven
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Building a supportive community of healthcare professionals and patients.
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Innovation
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Leveraging technology to improve healthcare communication and education.
            </p>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          Meet Our Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="aspect-w-1 aspect-h-1 relative h-64">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-purple-600 dark:text-purple-400 font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {member.background}
                </p>
                <a
                  href={`mailto:${member.email}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
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
