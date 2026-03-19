import { useState } from "react";
import { motion } from "motion/react";
import { GripVertical, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Slider } from "../../components/ui/slider";

// Mock image data - in real app this would come from previous screen
const mockImages = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  url: `https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?w=400&h=400&fit=crop`,
  duration: 3,
}));

export function ImagesToVideoArrangeScreen() {
  const navigate = useNavigate();
  const [images, setImages] = useState(mockImages);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const updateDuration = (id: number, duration: number) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, duration } : img))
    );
  };

  const handleContinue = () => {
    navigate("/images-to-video/style");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#d946ef]/5 -z-10" />

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/images-to-video/upload")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#6366f1] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to upload</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">
            Arrange Your Images
          </h1>
          <p className="text-gray-600">Drag to reorder and set duration for each image</p>
        </motion.div>

        {/* Arrangement Area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-8 mb-8"
        >
          <div className="space-y-4">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedImage(image.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedImage === image.id
                    ? "border-[#6366f1] bg-[#6366f1]/5"
                    : "border-gray-200 hover:border-gray-300 bg-white/50"
                }`}
              >
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Order Number */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white text-sm font-medium">
                  {index + 1}
                </div>

                {/* Image Preview */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                </div>

                {/* Image Info */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Image {index + 1}</p>
                  <p className="text-xs text-gray-500">Click to adjust duration</p>
                </div>

                {/* Duration Control */}
                <div className="flex items-center gap-4 min-w-[200px]">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <Slider
                      value={[image.duration]}
                      onValueChange={(value) => updateDuration(image.id, value[0])}
                      min={1}
                      max={10}
                      step={0.5}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                    {image.duration}s
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Total Duration */}
          <div className="mt-6 p-4 bg-gradient-to-r from-[#6366f1]/10 to-[#8b5cf6]/10 rounded-xl border border-[#6366f1]/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total Video Duration</span>
              <span className="text-lg font-bold text-[#6366f1]">
                {images.reduce((sum, img) => sum + img.duration, 0)}s
              </span>
            </div>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleContinue}
            className="w-full h-12 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] hover:opacity-90 transition-opacity rounded-xl"
          >
            Continue to Style Selection
          </Button>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 text-center"
        >
          <p className="text-sm text-gray-600">
            💡 <span className="font-medium">Tip:</span> Recommended duration is 2-5 seconds per image
          </p>
        </motion.div>
      </div>
    </div>
  );
}
