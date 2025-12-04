import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTelegram,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#1e293b] text-white pt-10 pb-6 px-4 sm:px-6 md:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-10">
        {/* Column 1: Logo & Contact Info */}
        <div className="space-y-4 transition-all duration-300 hover:-translate-y-1 active:-translate-y-1">
          <div className="flex items-center space-x-2">
            <img
              src="/app/CPBank-footer.png"
              alt="CPBank Logo"
              className="h-8 w-auto transition-all duration-300 hover:scale-105 active:scale-105"
            />
          </div>

          <div className="space-y-2 text-sm text-gray-300">
            <p className="transition-all duration-300 hover:text-white active:text-white text-sm sm:text-base md:text-sm lg:text-base">
              <span className="font-semibold text-white">Hotline: </span>
              070 200 002 | 1800 200 888
              <span className="block sm:inline">(ឥតគិតថ្លៃ)</span>
            </p>

            <p>
              <span className="font-semibold text-white">Email: </span>
              <a
                href="mailto:info@cambodiapostbank.com.kh"
                className="hover:text-white active:text-white transition-all"
              >
                info@cambodiapostbank.com.kh
              </a>
            </p>
          </div>
        </div>

        {/* Column 2: Address */}
        <div className="space-y-4 transition-all duration-300 hover:-translate-y-1 active:-translate-y-1">
          <h3 className="font-semibold text-lg">Address</h3>

          <div className="space-y-2 text-sm text-gray-300">
            <p className="transition-all duration-300 hover:text-white active:text-white">
              Building No 263, 1st – 6th Floor, Street No 110 ⊥ 61, Group 11,
              Phum 1, Sangkat Vat Phnum, Khan Doun Penh, Phnom Penh, Cambodia.
            </p>

            <p className="transition-all duration-300 hover:text-white active:text-white">
              <span className="font-semibold text-white">SWIFT Code: </span>
              CPBPKHP2
            </p>
          </div>
        </div>

        {/* Column 3: Social Media */}
        <div className="space-y-4 transition-all duration-300 hover:-translate-y-1 active:-translate-y-1">
          <h3 className="font-semibold text-lg">Follow Us</h3>

          <div className="flex space-x-2 sm:space-x-3 md:space-x-3 lg:space-x-4">
            {[
              {
                icon: <FaFacebook size={20} />,
                url: "https://www.facebook.com/cpbankplc/",
              },
              {
                icon: <FaLinkedin size={20} />,
                url: "https://www.linkedin.com/company/cp-bank-plc/",
              },
              {
                icon: <FaYoutube size={20} />,
                url: "https://www.youtube.com/@cpbankplc",
              },
              {
                icon: <FaInstagram size={20} />,
                url: "https://www.instagram.com/cpbank_plc/",
              },
              { icon: <FaTelegram size={20} />, url: "https://t.me/cpbankplc" },
            ].map((item, index) => (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-110 hover:shadow-lg active:shadow-lg"
                style={{ transitionTimingFunction: "ease-in-out" }}
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Column 4: Feedback QR Codes */}
        <div className="space-y-4 transition-all duration-300 hover:-translate-y-1 active:-translate-y-1">
          <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-2">
            {/* Customer Feedback */}
            <div className="flex flex-col items-center gap-2 min-w-[140px]">
              <span className="w-full text-xs font-semibold text-white bg-[#F37021] px-3 py-1 rounded-md shadow-md text-center">
                Customer Feedback
              </span>

              <div className="bg-white p-2 rounded-lg shadow-md transition-all duration-300 hover:scale-105 active:scale-105 hover:shadow-lg active:shadow-lg">
                <img
                  src="/assets/qr/customer-feedback-qr.jpg"
                  alt="Customer Feedback"
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain"
                />
              </div>
            </div>

            {/* Staff Feedback */}
            <div className="flex flex-col items-center gap-2 min-w-[140px]">
              <span className="w-full text-xs font-semibold text-white bg-[#F37021] px-3 py-1 rounded-md shadow-md text-center">
                Staff Feedback
              </span>

              <div className="bg-white p-2 rounded-lg shadow-md transition-all duration-300 hover:scale-105 active:scale-105 hover:shadow-lg active:shadow-lg">
                <img
                  src="/assets/qr/staff-feedback-qr.jpg"
                  alt="Staff Feedback"
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-400 transition-all duration-300 hover:text-white active:text-white">
        <p>© 2025 CP BANK IT department</p>
      </div>
    </footer>
  );
}
