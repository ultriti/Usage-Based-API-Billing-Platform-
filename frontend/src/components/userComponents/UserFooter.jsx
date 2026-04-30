import React from "react";
import { Phone, Mail, MapPin, CalendarDays } from "lucide-react";

const UserFooter = () => {
  return (
    <footer className="h-full w-full overflow-hidden text-white">
      <div className="w-full h-full">
        <div className="relative border border-white/5 bg-[#101116] px-6 py-16 ">
          {/* decorative lines */}
          {/* <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[26px]">
            <span className="absolute left-[-60px] top-[120px] h-[4px] w-[240px] rotate-[-44deg] rounded-full bg-cyan-400/15 blur-[1px]" />
            <span className="absolute left-[220px] top-[0px] h-[6px] w-[280px] rotate-[-49deg] rounded-full bg-cyan-400/10 blur-[1px]" />
            <span className="absolute right-[85px] top-[35px] h-[18px] w-[300px] rotate-[-49deg] rounded-full bg-cyan-400/12" />
            <span className="absolute right-[20px] top-[115px] h-[260px] w-[260px] rotate-[-49deg] rounded-full bg-cyan-400/10 blur-[1px]" />
            <span className="absolute bottom-[0px] right-[18px] h-[3px] w-[120px] rotate-[-45deg] rounded-full bg-cyan-400/15" />
            <span className="absolute bottom-[0px] left-[140px] h-[3px] w-[70px] rotate-[-45deg] rounded-full bg-cyan-400/12" />
          </div> */}

          <div className="relative z-10 text-center">
            <h2 className="mx-auto max-w-5xl text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Let’s Create Something Great Together
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
              Consectetur adipiscing elit sed do eiusmod tempor incididunt ut
              labore et dolore magna aliqua. Ut enim ad minim veniam quis
              nostrud exercitation
            </p>
            <button className="mt-10 inline-flex items-center justify-center rounded-full bg-[#57f0ea] px-10 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-[#061318] transition hover:scale-[1.02] hover:bg-[#6df6f1]">
              Make Inquiry
            </button>
          </div>

          <div className="relative z-10 mt-20 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-4xl font-black tracking-tight">PiRUS</div>
              <p className="mt-4 max-w-xs text-sm text-white/75">
                We are more than a digital agency
              </p>
            </div>

            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-[0.12em] text-white">
                Contact Us
              </h3>
              <ul className="mt-6 space-y-4 text-sm text-white/80">
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-cyan-300" />
                  <span>+1234567890</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-cyan-300" />
                  <span>support@domain.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin size={18} className="text-cyan-300" />
                  <span>West Virginia, USA</span>
                </li>
                <li className="flex items-center gap-3">
                  <CalendarDays size={18} className="text-cyan-300" />
                  <span>Monday to Friday</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-[0.12em] text-white">
                Our Services
              </h3>
              <ul className="mt-6 space-y-4 text-sm text-white/80">
                <li>Web Design</li>
                <li>Branding Design</li>
                <li>Digital Marketing</li>
                <li>Social Advertising</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-[0.12em] text-white">
                Quick Links
              </h3>
              <ul className="mt-6 space-y-4 text-sm text-white/80">
                <li>About</li>
                <li>Projects</li>
                <li>Contact</li>
                <li>Services</li>
              </ul>
            </div>
          </div>

          <div className="relative z-10 mt-16 border-t border-white/10 pt-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-white/85">
                  <span>Privacy Policy</span>
                  <span>Terms Of Use</span>
                  <span>
                    Copyright © 2025 Pirus. Powered by{" "}
                    <span className="text-cyan-300">
                      Gutenverse Blocks Addons.
                    </span>
                  </span>
                </div>
                <p className="max-w-2xl text-xs leading-5 text-white/45">
                  Lorem ipsum dolor sit amet consectetur adipiscing elit. Ut
                  elit tellus luctus nec ullamcorper mattis pulvinar dapibus
                  leo.
                </p>
              </div>

              <div className="flex items-center gap-4 text-white">
                <a href="#" className="text-white/85 hover:text-cyan-300">
                  {/* <Facebook size={18} /> */}
                </a>
                <a href="#" className="text-white/85 hover:text-cyan-300">
                  {/* <X size={18} /> */}
                </a>
                <a href="#" className="text-white/85 hover:text-cyan-300">
                  {/* <Instagram size={18} /> */}
                </a>
                <a href="#" className="text-white/85 hover:text-cyan-300">
                  {/* <Youtube size={18} /> */}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UserFooter;
