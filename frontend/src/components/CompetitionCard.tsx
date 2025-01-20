import Link from "next/link";

const CompetitionCard = ({
  title,
  description,
  link,
  imageSrc,
  status,
  tournament_id,
}) => {
  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
      {/* 圖片區塊 */}
      <div className="h-40 bg-gray-300 flex items-center justify-center">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 border-2 border-gray-400 flex items-center justify-center">
            <span className="text-gray-400 font-semibold">X</span>
          </div>
        )}
      </div>

      {/* 內容區塊 */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 text-sm mb-4 whitespace-pre-line">
          {description}
        </p>

        {/* 報名按鈕 */}
        {status === "報名中" ? (
          <Link href={link}>
            <span className="text-blue-500 font-medium flex items-center group cursor-pointer">
              點此報名{" "}
              <span className="ml-1 transition-transform group-hover:translate-x-1 duration-300">
                →
              </span>
            </span>
          </Link>
        ) : (
          <span className="text-gray-400 font-medium flex items-center cursor-not-allowed">
            報名已截止
          </span>
        )}

        {/* 查詢賽程按鈕（僅在「進行中」或「已結束」才顯示） */}
        {(status === "進行中" || status === "已結束") && (
          <Link href={`/search_competition/${tournament_id}`}>
            <span className="text-blue-500 font-medium flex items-center group cursor-pointer mt-2">
              查詢賽程{" "}
              <span className="ml-1 transition-transform group-hover:translate-x-1 duration-300">
                →
              </span>
            </span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default CompetitionCard;
