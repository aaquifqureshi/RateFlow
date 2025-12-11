import { useEffect, useState } from "react";
import Logo from "../../assets/logo.png";
import Git_Logo from "../../assets/git_logo.png";
import Divider from "../../components/Divider";

export default function Header() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  // Toggle theme + persist
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <header
      className="
      sticky top-0 z-50 
      bg-white
    "
    >
      <div className="px-2 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={Logo}
            alt="RateFlow Logo"
            className="h-15 w-auto object-contain"
          />
        </div>

        {/* RIGHT — Controls */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => setDark(!dark)}
            aria-label="Toggle Theme"
            className="
              w-12 h-6 bg-gray-300 dark:bg-gray-600 
              rounded-full p-1 flex items-center transition
            "
          >
            <div
              className={`
                w-4 h-4 rounded-full bg-white shadow 
                transform transition 
                ${dark ? "translate-x-6" : ""}
              `}
            ></div>
          </button>

          <a
            href="https://github.com/aaquifqureshi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <img
              src={Git_Logo}
              alt="GitHub Link"
              className="h-12 w-auto object-contain cursor-pointer hover:opacity-80 transition"
            />
          </a>
        </div>
      </div>
      <Divider
        orientation="horizontal"
        length="95%"
        thickness="1px"
        className="mx-auto"
      />
    </header>
  );
}
