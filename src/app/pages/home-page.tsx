import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Sparkles, Video, Image as ImageIcon, Clock, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";

const durations = [
	{ value: 1, label: "1 min" },
	{ value: 2, label: "2 min" },
	{ value: 5, label: "5 min" },
];

export function HomePage() {
	const navigate = useNavigate();
	const [prompt, setPrompt] = useState("");
	const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
	const [referenceVideo, setReferenceVideo] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isRefDragging, setIsRefDragging] = useState(false);
	const [selectedDuration, setSelectedDuration] = useState(2);

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>, isReference = false) => {
		e.preventDefault();
		if (isReference) {
			setIsRefDragging(true);
		} else {
			setIsDragging(true);
		}
	};

	const handleDragLeave = (isReference = false) => {
		if (isReference) {
			setIsRefDragging(false);
		} else {
			setIsDragging(false);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>, isReference = false) => {
		e.preventDefault();
		if (isReference) {
			setIsRefDragging(false);
			const files = Array.from(e.dataTransfer.files);
			if (files.length > 0) {
				setReferenceVideo(files[0]);
			}
		} else {
			setIsDragging(false);
			const files = Array.from(e.dataTransfer.files);
			setUploadedFiles((prev) => [...prev, ...files]);
		}
	};

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const files = Array.from(e.target.files);
			setUploadedFiles((prev) => [...prev, ...files]);
		}
	};

	const handleReferenceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setReferenceVideo(e.target.files[0]);
		}
	};

const handleGenerate = async () => {
  if (!prompt.trim()) {
    alert("Enter prompt");
    return;
  }

  if (uploadedFiles.length === 0) {
    alert("Upload at least one video");
    return;
  }

  try {
    const formData = new FormData();

    // ✅ send main video file
    formData.append("file", uploadedFiles[0]);

    // ✅ send prompt
    formData.append("prompt", prompt);

    // ✅ send selected duration
    formData.append("duration", String(selectedDuration * 60)); // convert min → seconds

    // ✅ optional reference video
    if (referenceVideo) {
      formData.append("reference", referenceVideo);
    }

		const res = await fetch("/api/generate", {
      method: "POST",
      body: formData,
    });

		const rawBody = await res.text();
		let data: any = {};
		if (rawBody) {
			try {
				data = JSON.parse(rawBody);
			} catch {
				data = { error: rawBody };
			}
		}

    console.log("Backend response:", data);

    if (!data.success) {
			alert(data.error || `Video generation failed (${res.status})`);
      return;
    }

    // ✅ store video path
    localStorage.setItem("generatedVideo", data.video);

    // ✅ go to result page
    navigate("/result");

  } catch (err) {
    console.error(err);
    alert("Error generating video");
  }
};

	const removeFile = (index: number) => {
		setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	return (
		<div className="min-h-screen relative overflow-hidden">
			{/* Gradient Background */}
			<div className="fixed inset-0 bg-gradient-to-br from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#d946ef]/5 -z-10" />
			<div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.1),transparent_50%)] -z-10" />
			<div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.1),transparent_50%)] -z-10" />

			<div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
				{/* Back Button */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5 }}
					className="mb-8"
				>
					<button
						onClick={() => navigate("/")}
						className="inline-flex items-center gap-2 text-gray-600 hover:text-[#6366f1] transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						<span className="text-sm">Back to selection</span>
					</button>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-12"
				>
					{/* Hero Section */}
					<div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 mb-6">
						<Sparkles className="w-4 h-4 text-[#6366f1]" />
						<span className="text-sm text-gray-600">Powered by AI</span>
					</div>

					<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-linear-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">
						AI Video Editor
					</h1>

					<p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-2">
						Transform your ideas into stunning cinematic videos
					</p>
					<p className="text-base text-gray-500 max-w-xl mx-auto">
						Simply describe your vision, upload your media, and let AI create professional videos in seconds
					</p>
				</motion.div>

				{/* Main Content Card */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8 lg:p-10"
				>
					{/* Prompt Input */}
					<div className="mb-8">
						<label className="block text-sm mb-3 text-gray-700">
							Describe your video
						</label>
						<Textarea
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
							placeholder="A cinematic travel video showcasing the beauty of Iceland with aerial drone shots, northern lights, and waterfalls..."
							className="min-h-[120px] text-base resize-none rounded-xl border-gray-300 focus:border-[#6366f1] focus:ring-[#6366f1] bg-white/50"
						/>
					</div>

					{/* Upload Area */}
					<div className="mb-8">
						<label className="block text-sm mb-3 text-gray-700">
							Upload your media files
						</label>
						<div
							onDragOver={(e) => handleDragOver(e, false)}
							onDragLeave={() => handleDragLeave(false)}
							onDrop={(e) => handleDrop(e, false)}
							className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-200 ${
								isDragging
									? "border-[#6366f1] bg-[#6366f1]/5"
									: "border-gray-300 hover:border-gray-400 bg-white/30"
							}`}
						>
							<input
								type="file"
								multiple
								accept="video/*,image/*"
								onChange={handleFileInput}
								className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							/>
							<div className="flex flex-col items-center gap-4">
								<div className="w-16 h-16 rounded-full bg-linear-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
									<Upload className="w-8 h-8 text-white" />
								</div>
								<div>
									<p className="text-base mb-1">
										<span className="font-medium text-[#6366f1]">Click to upload</span> or drag and drop
									</p>
									<p className="text-sm text-gray-500">Videos and images (MP4, MOV, JPG, PNG)</p>
								</div>
							</div>
						</div>

						{/* Uploaded Files List */}
						{uploadedFiles.length > 0 && (
							<div className="mt-4 space-y-2">
								{uploadedFiles.map((file, index) => (
									<motion.div
										key={index}
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										className="flex items-center justify-between bg-white/50 rounded-lg p-3 border border-gray-200"
									>
										<div className="flex items-center gap-3">
											{file.type.startsWith("video") ? (
												<Video className="w-5 h-5 text-[#6366f1]" />
											) : (
												<ImageIcon className="w-5 h-5 text-[#8b5cf6]" />
											)}
											<span className="text-sm text-gray-700">{file.name}</span>
										</div>
										<button
											onClick={() => removeFile(index)}
											className="text-gray-400 hover:text-red-500 transition-colors"
										>
											×
										</button>
									</motion.div>
								))}
							</div>
						)}
					</div>

					{/* Optional Reference Video */}
					<div className="mb-8">
						<label className="block text-sm mb-3 text-gray-700">
							Reference video (optional)
						</label>
						<div
							onDragOver={(e) => handleDragOver(e, true)}
							onDragLeave={() => handleDragLeave(true)}
							onDrop={(e) => handleDrop(e, true)}
							className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
								isRefDragging
									? "border-[#8b5cf6] bg-[#8b5cf6]/5"
									: "border-gray-300 hover:border-gray-400 bg-white/30"
							}`}
						>
							<input
								type="file"
								accept="video/*"
								onChange={handleReferenceInput}
								className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							/>
							{referenceVideo ? (
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<Video className="w-5 h-5 text-[#8b5cf6]" />
										<span className="text-sm text-gray-700">{referenceVideo.name}</span>
									</div>
									<button
										onClick={(e) => {
											e.stopPropagation();
											setReferenceVideo(null);
										}}
										className="text-gray-400 hover:text-red-500 transition-colors"
									>
										×
									</button>
								</div>
							) : (
								<div className="flex items-center justify-center gap-3">
									<Upload className="w-5 h-5 text-gray-400" />
									<p className="text-sm text-gray-500">Upload a reference video for style matching</p>
								</div>
							)}
						</div>
					</div>

					{/* Duration Selection */}
					<div className="mb-8">
						<label className="block text-sm mb-3 text-gray-700">
							Select video duration
						</label>
						<div className="flex items-center justify-center gap-4">
							{durations.map((duration) => (
								<button
									key={duration.value}
									onClick={() => setSelectedDuration(duration.value)}
									className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all duration-200 ${
										selectedDuration === duration.value
											? "border-[#6366f1] bg-[#6366f1]/10 text-[#6366f1]"
											: "border-gray-300 hover:border-gray-400 bg-white/30 text-gray-700"
									}`}
								>
									<Clock className="w-4 h-4" />
									<span>{duration.label}</span>
								</button>
							))}
						</div>
					</div>

					{/* Generate Button */}
					<Button
						onClick={handleGenerate}
						disabled={!prompt.trim()}
						className="w-full h-14 text-lg rounded-xl bg-linear-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Sparkles className="w-5 h-5 mr-2" />
						Generate Video
					</Button>
				</motion.div>

				{/* Feature Pills */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="mt-12 flex flex-wrap justify-center gap-4"
				>
					{["AI-Powered Editing", "Instant Results", "4K Export", "No Watermark"].map((feature, index) => (
						<div
							key={index}
							className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200 text-sm text-gray-600"
						>
							{feature}
						</div>
					))}
				</motion.div>
			</div>
		</div>
	);
}