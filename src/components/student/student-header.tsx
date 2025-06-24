export default function Header() {
    return (
        <header className="relative mb-8 bg-gradient-to-br from-[#118AB2] via-[#06D6A0] to-[#073B4C] text-white p-6 md:p-8 text-center shadow-xl min-h-[180px] flex flex-col justify-center transform hover:scale-[1.02] transition-all duration-300 overflow-hidden">
            {/* Lingkaran dekoratif */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            {/* Gelombang dekoratif */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>

            {/* Segitiga dekoratif */}
            <div className="absolute top-1/2 right-4 w-12 h-12 bg-white opacity-10 rotate-45"></div>
            <div className="absolute bottom-1/4 left-1/4 w-8 h-8 bg-white opacity-10 rotate-12"></div>

            {/* Ikon pendidikan */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                    </svg>
                </div>
            </div>

            {/* Konten header */}
            <div className="relative z-10">
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight drop-shadow-md">
                    Selamat Datang di <span className="text-yellow-300">EduScan</span>
                </h1>
                <p className="mt-3 text-base md:text-lg font-medium opacity-95 drop-shadow-sm">Jelajahi EduScan & Temukan Gaya Belajarmu!</p>
                <div className="mt-4 flex justify-center">
                    <div className="px-4 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">Solusi Belajar Anda #1</div>
                </div>
            </div>
        </header>
    );
}
