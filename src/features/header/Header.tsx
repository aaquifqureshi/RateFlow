import Logo from "../../assets/logo.png";
import Git_Logo from "../../assets/git_logo.png";
import Divider from "../../components/Divider";

export default function Header() {
  return (
    <header
      className="
      sticky top-0 z-50 
      bg-white
    "
    >
      <div className="px-2 py-1 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={Logo}
            alt="RateFlow Logo"
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* RIGHT — Controls */}
        <div className="flex items-center gap-5">
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
        color="bg-gray-300"
        className="mx-auto traslate-y-10"
      />
    </header>
  );
}
