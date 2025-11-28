import LanguageSwitcher from "@/components/shared/common/language-switcher";

export const PageHeader = () => {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm px-5">
            <div className="mx-auto lg:px-10 md:px-5 sm:px-0 py-4 flex items-center justify-between">
                <div className="flex items-center">
                    <img src="/app/CP-bank-Logo.png" alt="Bank Logo" className="h-12" />
                </div>
                <LanguageSwitcher variant="flag-only" />
            </div>
        </div>
    );
};
