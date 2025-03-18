import { Metadata } from "next";
import { 
  BuildingOffice2Icon, 
  ClipboardDocumentListIcon,
  DocumentTextIcon, 
  BookmarkSquareIcon, 
  StarIcon, 
  LifebuoyIcon 
} from "@heroicons/react/24/solid";

export const metadata: Metadata = {
  title: "Home",
};

export default function HomePage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-[5%]">Chào mừng bạn đến với hệ thống</h1>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="p-8 bg-red-400 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <BuildingOffice2Icon className="h-6 w-6 text-white mr-2" />
            <h2 className="text-xl font-bold">Thông tin phòng trọ</h2>
          </div>
          <p className="text-justify">
            Người thuê có thể tìm và xem thông tin chi tiết về phòng trọ, bao gồm gợi ý phòng phù hợp với nhu cầu cá nhân.
          </p>
        </div>

        <div className="p-8 bg-green-400 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <ClipboardDocumentListIcon className="h-6 w-6 text-white mr-2" />
            <h2 className="text-xl font-bold">Lịch sử cho thuê</h2>
          </div>
          <p className="text-justify">
            Dễ dàng quản lý và theo dõi các bản ghi liên quan đến các hợp đồng cho thuê và lịch sử thanh toán cá nhân.
          </p>
        </div>

        <div className="p-8 bg-blue-400 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="h-6 w-6 text-white mr-2" />
            <h2 className="text-xl font-bold">Hóa đơn hằng tháng</h2>
          </div>
          <p className="text-justify">
            Người thuê có thể xem và thanh toán hóa đơn tiền phòng, điện, nước, wifi, hoặc các dịch vụ khác một cách dễ dàng.
          </p>
        </div>

        <div className="p-8 bg-yellow-400 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <BookmarkSquareIcon className="h-6 w-6 text-white mr-2" />
            <h2 className="text-xl font-bold">Lưu phòng yêu thích</h2>
          </div>
          <p className="text-justify">
            Lưu lại các phòng trọ yêu thích của bạn vào mục “Xem sau” để dễ dàng truy cập và so sánh khi cần thiết.
          </p>
        </div>

        <div className="p-8 bg-purple-400 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <StarIcon className="h-6 w-6 text-white mr-2" />
            <h2 className="text-xl font-bold">Đánh giá phòng trọ</h2>
          </div>
          <p className="text-justify">
            Chia sẻ đánh giá của bạn về các phòng trọ để hỗ trợ người thuê khác và nâng cao chất lượng dịch vụ.
          </p>
        </div>

        <div className="p-8 bg-pink-400 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <LifebuoyIcon className="h-6 w-6 text-white mr-2" />
            <h2 className="text-xl font-bold">Liên hệ hỗ trợ</h2>
          </div>
          <p className="text-justify">
            Người thuê có thể liên hệ với quản lý nếu có thắc mắc hoặc khiếu nại liên quan đến phòng trọ.
          </p>
        </div>
      </div>
    </div>
  );
}
