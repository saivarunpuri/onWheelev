import React from "react";
import {
  Compass,
  ShieldCheck,
  Zap,
  Leaf,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left bg-cyber-bg">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          About OnWheel EV
        </h1>
        <p className="text-gray-400 text-sm mt-2 max-w-lg mx-auto">
          Resolving range anxiety and facilitating transition to green,
          carbon-neutral electric vehicle transportation.
        </p>
      </div>

      <div className="space-y-10">
        {/* Simple Explanation Block */}
        <div className="bg-cyber-card border border-cyber-gray-800 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-cyber-green/5 text-cyber-green font-mono text-[9px] uppercase border-b border-l border-cyber-gray-800 rounded-bl-lg">
            SIMPLIFIED_GUIDE: ACTIVE
          </div>

          <h2 className="text-xl font-bold text-white">OnWheel EV In Plain English</h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            Driving an electric car is amazing, but it can be stressful when you worry about running out of battery before reaching your destination. 
            This fear is called <strong>Range Anxiety</strong>, and it is the single biggest reason why people hesitate to buy electric cars.
          </p>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            <strong>OnWheel EV is built to eliminate this fear completely.</strong> We do this in three main ways:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-gray-400 space-y-2">
            <li>
              <strong className="text-white">Smart Charger Mapping:</strong> Instead of just showing standard map dots, we tell you exactly when your car will need power and coordinate the best stations for your exact model.
            </li>
            <li>
              <strong className="text-white">On-Demand Roadside Assistance:</strong> If your battery dies mid-journey, you don't need a tow truck. Use our app to summon a portable battery van directly to your GPS coordinates for a quick emergency charge.
            </li>
            <li>
              <strong className="text-white">EV Analytics & Diagnostics:</strong> Review how well your battery is holding up over time, keep track of charging costs, and see the tangible impact you are making on the environment.
            </li>
          </ul>
        </div>

        {/* Pitch block */}
        <div className="bg-cyber-card border border-cyber-gray-800 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-cyber-green/5 text-cyber-green font-mono text-[9px] uppercase border-b border-l border-cyber-gray-800 rounded-bl-lg">
            ONWHEEL_MISSION: ACTIVE
          </div>

          <h2 className="text-xl font-bold text-white">Why OnWheel EV?</h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            One of the single greatest bottlenecks to mass-market adoption of
            electric vehicles is <b>Range Anxiety</b> — the fear that your
            vehicle's battery will run dry before reaching your destination.
            Traditional maps only present pins of charging stations but do not
            calculate battery decay rates based on EV models, nor do they
            suggest optimal stop intervals or connect drivers with on-site
            emergency responders.
          </p>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            OnWheel EV was built to address this exact gap. By coupling smart
            route battery calculators, interactive GIS simulator networks, and
            emergency charging rescue coordinates, we provide a reliable
            safety-net for long-distance EV trips.
          </p>
        </div>

        {/* Feature listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#121212] border border-cyber-gray-800 rounded-xl p-5 text-left flex gap-4">
            <div className="p-3 bg-cyber-green/10 rounded-lg text-cyber-green h-fit">
              <Zap className="w-5 h-5 fill-cyber-green" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-white text-sm sm:text-base">
                Intelligent Stop Planning
              </h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Recommends charging stop points dynamically where vehicle charge
                drops below 20%, estimating charging durations based on grid
                power.
              </p>
            </div>
          </div>

          <div className="bg-[#121212] border border-cyber-gray-800 rounded-xl p-5 text-left flex gap-4">
            <div className="p-3 bg-cyber-green/10 rounded-lg text-cyber-green h-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-white text-sm sm:text-base">
                GPS Rescue Network
              </h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Connects stranded drivers directly with mobile energy vans
                carrying DC portable chargers to get them to the next grid stop.
              </p>
            </div>
          </div>

          <div className="bg-[#121212] border border-cyber-gray-800 rounded-xl p-5 text-left flex gap-4">
            <div className="p-3 bg-cyber-green/10 rounded-lg text-cyber-green h-fit">
              <Leaf className="w-5 h-5 text-cyber-accent" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-white text-sm sm:text-base">
                Eco Analytics Dashboard
              </h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Visualizes carbon offsets and financial gains accumulated vs
                traditional fossil-fuel vehicles during operations.
              </p>
            </div>
          </div>

          <div className="bg-[#121212] border border-cyber-gray-800 rounded-xl p-5 text-left flex gap-4">
            <div className="p-3 bg-cyber-green/10 rounded-lg text-cyber-green h-fit">
              <Compass className="w-5 h-5 text-cyber-accent" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-white text-sm sm:text-base">
                Simulated GIS Pathing
              </h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Features vector route overlays, vehicle mapping tracks, and live
                rescuer navigation dispatches synchronously.
              </p>
            </div>
          </div>
        </div>

        {/* Technical architecture list */}
        <div className="bg-cyber-card border border-cyber-gray-800 rounded-2xl p-6 text-xs text-gray-500 space-y-3 font-mono">
          <h4 className="font-bold text-white uppercase tracking-wider">
            OnWheel MERN Architecture stack
          </h4>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[10px]">
            <li className="p-2.5 bg-[#0b0c10] border border-cyber-gray-900 rounded-lg">
              React.js Client
            </li>
            <li className="p-2.5 bg-[#0b0c10] border border-cyber-gray-900 rounded-lg">
              Express Node APIs
            </li>
            <li className="p-2.5 bg-[#0b0c10] border border-cyber-gray-900 rounded-lg">
              Mongoose Engine
            </li>
            <li className="p-2.5 bg-[#0b0c10] border border-cyber-gray-900 rounded-lg">
              JWT Cipher Auths
            </li>
          </ul>
        </div>

        {/* Contact Details */}
        <div className="bg-cyber-card border border-cyber-gray-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
          <h2 className="text-xl font-bold text-white">Contact Us</h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            Have questions, feedback, or need emergency EV support? Reach out to
            our team.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center space-y-3 bg-[#121212] p-4 rounded-xl border border-cyber-gray-800 transition hover:border-cyber-green">
              <div className="p-3 bg-cyber-green/10 rounded-full text-cyber-green">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Email Support</h4>
              <p className="text-cyber-green text-xs font-mono">
                support@onwheel.ev
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 bg-[#121212] p-4 rounded-xl border border-cyber-gray-800 transition hover:border-cyber-green">
              <div className="p-3 bg-cyber-green/10 rounded-full text-cyber-green">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Hotline</h4>
              <p className="text-cyber-green text-xs font-mono">
                +91 9542082018
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 bg-[#121212] p-4 rounded-xl border border-cyber-gray-800 transition hover:border-cyber-green">
              <div className="p-3 bg-cyber-green/10 rounded-full text-cyber-green">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">Headquarters</h4>
              <p className="text-gray-400 text-xs">
                Madhapur, Hyderabad, India
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
