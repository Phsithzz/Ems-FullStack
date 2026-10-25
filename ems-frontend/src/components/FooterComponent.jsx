import React from "react";

const FooterComponent = () => {
  return (
    <footer className="py-4 px-8 border-t border-slate-100 bg-white text-center text-xs text-slate-400">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <span>© 2026 PayPulse Platform — Enterprise Financial & Card Suite</span>
        <span className="font-medium text-slate-500">
          Built with Spring Boot & React by Phoosith
        </span>
      </div>
    </footer>
  );
};

export default FooterComponent;
