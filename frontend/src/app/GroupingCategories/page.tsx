import Link from "next/link";

const GroupCard = ({ title, description, link }) => {
  return (
    <Link href={link}>
      <div className="max-w-sm w-full h-64 mx-auto flex flex-col justify-center items-center rounded-xl overflow-hidden shadow-lg border-2 border-transparent hover:border-indigo-400 bg-white bg-gradient-to-r from-gray-100 to-gray-50 hover:from-indigo-50 hover:to-blue-50 transform hover:scale-105 transition duration-300 cursor-pointer">
        <h2 className="text-2xl font-extrabold text-indigo-700 mb-3">
          {title}
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed text-center whitespace-pre-wrap">
          {description}
        </p>
      </div>
    </Link>
  );
};

const GroupSelection = () => {
  const groups = [
    {
      id: 1,
      title: "大專組",
      description: "個人賽報名人數: 20\n團體賽報名隊數: 5",
      link: "/group-details/college",
    },
    {
      id: 2,
      title: "社會組",
      description: "個人賽報名人數: 20\n團體賽報名隊數: 5",
      link: "/group-details/society",
    },
    {
      id: 3,
      title: "裁判組",
      description: "詳情請點選此卡片",
      link: "/group-details/judge",
    },
  ];

  return (
    <div className="min-h-screen p-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            title={group.title}
            description={group.description}
            link={group.link}
          />
        ))}
      </div>
    </div>
  );
};

export default GroupSelection;
