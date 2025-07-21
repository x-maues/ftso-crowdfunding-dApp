import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Shield, Zap, LineChart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";

export default function About() {
  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl mt-12 font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-6">
            How Crowdfunding on Fledge Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A deep dive into our crowdfunding platform and its integration with Flare&apos;s Time Series Oracle (FTSO)
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-16">
          {/* Non-Technical Overview */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-300 via-purple-400 to-pink-300 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-pink-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold text-pink-600">
                  Simple Overview
                </h2>
              </div>
              <div className="prose prose-lg max-w-none prose-p:text-gray-600 prose-headings:text-gray-900">
                <p className="text-lg leading-relaxed">
                  Our crowdfunding platform makes it easy to create and manage fundraising campaigns on the Flare network. 
                  What makes it special is how it uses Flare&apos;s Time Series Oracle (FTSO) to keep track of FLR token prices in real-time.
                </p>
                <p className="text-lg leading-relaxed">
                  When you create a campaign, you set your funding goal in USD. The platform automatically converts this to FLR 
                  using current market prices from FTSO. This means your campaign&apos;s progress is always accurate, regardless of 
                  FLR price fluctuations.
                </p>
                <p className="text-lg leading-relaxed">
                  Contributors can donate FLR tokens, and the platform instantly calculates the USD value of their contribution 
                  using the latest FTSO price data. This ensures transparency and accuracy throughout the entire crowdfunding process.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Technical Deep Dive */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.3, margin: "0px" }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-300 via-purple-400 to-pink-300 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-pink-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white">
                  <Zap className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold text-pink-600">
                  Technical Deep Dive
                </h2>
              </div>
              <div className="prose prose-lg max-w-none prose-p:text-gray-600 prose-headings:text-gray-900">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">FTSO Integration</h3>
                <p className="text-lg leading-relaxed mb-6">
                  The platform integrates with Flare&apos;s FTSO through the following key components:
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mt-1 flex-shrink-0">
                      <span className="text-sm font-semibold">1</span>
                    </div>
                    <div>
                      <strong className="text-gray-900">Price Feed Integration:</strong> The smart contract uses FTSO&apos;s FLR/USD price feed (ID: 0x01464c522f55534400000000000000000000000000) 
                      to get real-time price data.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mt-1 flex-shrink-0">
                      <span className="text-sm font-semibold">2</span>
                    </div>
                    <div>
                      <strong className="text-gray-900">Price Updates:</strong> FTSO provides price updates every 3 minutes, ensuring our platform has access to 
                      current market data.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mt-1 flex-shrink-0">
                      <span className="text-sm font-semibold">3</span>
                    </div>
                    <div>
                      <strong className="text-gray-900">Decimals Handling:</strong> The contract properly handles price feed decimals to ensure accurate USD value calculations.
                    </div>
                  </li>
                </ul>

                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Smart Contract Architecture</h3>
                <p className="text-lg leading-relaxed mb-6">
                  The platform consists of two main contracts:
                </p>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-pink-50 rounded-xl p-6 border border-pink-100">
                    <h4 className="text-xl font-semibold text-pink-600 mb-4">CrowdfundingFactory</h4>
                    <p className="text-gray-600">Creates and manages individual campaign contracts, maintaining a registry of all campaigns.</p>
                  </div>
                  <div className="bg-pink-50 rounded-xl p-6 border border-pink-100">
                    <h4 className="text-xl font-semibold text-pink-600 mb-4">CrowdfundingCampaign</h4>
                    <p className="text-gray-600">Handles individual campaign logic, including FTSO integration, contribution tracking, goal monitoring, and fund distribution.</p>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Key Technical Features</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 border border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Real-time Price Checks</h4>
                    <p className="text-gray-600">The <code className="bg-pink-50 px-2 py-1 rounded text-sm">checkGoalReached()</code> function uses FTSO data to verify campaign goals.</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Secure Fund Handling</h4>
                    <p className="text-gray-600">Implements ReentrancyGuard to prevent potential attacks during fund transfers.</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">USD Value Calculation</h4>
                    <p className="text-gray-600">Uses FTSO price data to calculate the USD value of FLR contributions in real-time.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* How to Use */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.3, margin: "0px" }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-pink-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white">
                  <LineChart className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold text-pink-600">
                  How to Use the Platform
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group bg-white rounded-xl p-6 border border-pink-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Create a Campaign</h3>
                  <p className="text-gray-600 mb-4">
                    Set your funding goal in USD. The platform will automatically convert it to FLR using current FTSO prices.
                  </p>
                  <Link 
                    href="/create"
                    className="inline-flex items-center text-pink-600 hover:text-pink-700 transition-colors"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
                <div className="group bg-white rounded-xl p-6 border border-pink-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Contribute</h3>
                  <p className="text-gray-600 mb-4">
                    Send FLR tokens to support campaigns. Your contribution&apos;s USD value is calculated using real-time FTSO data.
                  </p>
                  <Link 
                    href="/campaigns"
                    className="inline-flex items-center text-pink-600 hover:text-pink-700 transition-colors"
                  >
                    View Campaigns
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
                <div className="group bg-white rounded-xl p-6 border border-pink-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                    <LineChart className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Track Progress</h3>
                  <p className="text-gray-600 mb-4">
                    Monitor your campaign&apos;s progress with real-time updates on contributions and FLR/USD price movements.
                  </p>
                  <Link 
                    href="/campaigns"
                    className="inline-flex items-center text-pink-600 hover:text-pink-700 transition-colors"
                  >
                    Track Campaigns
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
    </>
  );
} 