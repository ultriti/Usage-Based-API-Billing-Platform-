import React from "react";
import { Phone, Mail, MapPin, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="h-full w-full overflow-hidden text-white  opacity-80 hover:opacity-90">
      <div className="w-full h-full">
        <div className="relative border border-white/5 bg-[#101116] px-6 py-16 ">
          <div className="relative z-10 text-center">
            <h2 className="mx-auto max-w-5xl text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Let’s Create Something Great Together
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
              Welcome to your personal API dashboard. Here you can view your active API keys, track request usage in real time, monitor billing, and manage your subscription plan. Stay on top of your API activity with clear analytics and secure access.
            </p>
            <button
              className="mt-10 inline-flex items-center justify-center rounded-full bg-[#57f0ea] px-10 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-[#061318] transition hover:scale-[1.02] hover:bg-[#6df6f1] cursor-pointer"
              onClick={() => {
                navigate("/provider/login");
              }}
            >
              
              bill your api's
            </button>
          </div>

          <div className="relative z-10 mt-20 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-4xl font-black tracking-tight">Ultriti</div>
              <p className="mt-4 max-w-xs text-sm text-white/75">
                We are more than a digital agency
              </p>
              <p className="mt-4 max-w-xs text-sm text-white/75">
                we specialize in converting visionary ideas into practicle
                solutions
              </p>
            </div>

            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-[0.12em] text-white">
                Contact Us
              </h3>
              <ul className="mt-6 space-y-4 text-sm text-white/80">
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-cyan-300" />
                  <span>+91 895X6X4X9X</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-cyan-300" />
                  <span>ultrititech@gmail.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin size={18} className="text-cyan-300" />
                  <span>karnataka, india</span>
                </li>
                {/* <li className="flex items-center gap-3">
                  <CalendarDays size={18} className="text-cyan-300" />
                  <span>Monday to Friday</span>
                </li> */}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-[0.12em] text-white">
                Our Services
              </h3>
              <ul className="mt-6 space-y-4 text-sm text-white/80">
                <li>Web Design</li>
                <li>software development</li>
                <li>Digital Marketing</li>
                <li>Social Advertising</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-[0.12em] text-white">
                Quick Links
              </h3>
              <ul className="mt-6 space-y-4 text-sm text-white/80">
                <li ><a href="/user/HomePage">Home</a></li>
                <li><a href="/user/ProfilePage">Profile</a></li>
                <li><a href="https://www.ultriticart.in/" target="blank_">Services</a></li>
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
                    Copyright © 2025 meterflow. Powered by{" "}
                    <span className="text-cyan-300">
                      ULTRITI
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
