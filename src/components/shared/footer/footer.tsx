export default function Footer() {
  return (
    <footer className="bg-[#f97316] text-white py-4 px-6">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left Section */}
        <div className="flex flex-col md:flex-row items-center lg:gap-24 gap-6 text-center md:text-left">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-2">
            <img
              src="/app/CPBank-footer.png"
              alt="CPBank Logo"
              className="h-6 lg:w-48 md:w-32 w-48"
            />
          </div>

          {/* Contact Info */}
          <div>
            <p>
              <span className="font-semibold text-sm">Office Phone: </span>
              <span className="text-sm">+855 (0) 70 200 002 | 1800 200 888</span>
            </p>
            <p>
              <span className="font-semibold text-sm">Email: </span>
              <a
                href="mailto:info@cambodiapostbank.com.kh"
                className="underline hover:text-gray-100 text-sm"
              >
                info@cambodiapostbank.com.kh
              </a>
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="lg:max-w-md md:max-w-[250px] sm:max-w-80 text-center md:text-left">
          <p>
            <span className="font-semibold text-sm">Address: </span>
            <span className="text-sm">
              Building No 263, 1st – 6th Floor, Street No 110 ⊥ 61, Group 11, Phum 1,
              Sangkat Vat Phnum, Khan Doun Penh, Phnom Penh, Cambodia.
            </span>
          </p>
          <p className="mt-1">
            <span className="font-semibold text-sm">SWIFT Code: </span>
            <span className="text-sm">CPBPKHP2</span>
          </p>
        </div>
      </div>
    </footer>
  );
}