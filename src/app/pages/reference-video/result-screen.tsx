import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowLeft, Download, RefreshCcw, Video } from "lucide-react";
import { Button } from "../../components/ui/button";

export function ReferenceVideoResultScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#d946ef]/5 -z-10" />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#6366f1] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to selection</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">
            Reference Video Generated
          </h1>
          <p className="text-gray-600 mb-8">Your generated video is ready for preview and export.</p>

          <div className="aspect-video rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 mb-8 flex items-center justify-center">
            <Video className="w-14 h-14 text-white/80" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="h-11 px-5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-90">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/reference-video/setup")}
              className="h-11 px-5 border-gray-300 hover:border-[#6366f1] hover:text-[#6366f1]"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Generate Again
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
